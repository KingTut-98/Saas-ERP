-- PL/pgSQL Functions for TRN Validation and CBE Wallet Limit Processing

-- 1. Function: Validate 9-Digit Egyptian TRN (الرقم الضريبي)
CREATE OR REPLACE FUNCTION validate_trn(p_trn TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    cleaned_trn TEXT;
BEGIN
    IF p_trn IS NULL THEN
        RETURN FALSE;
    END IF;
    -- Remove any hyphens or spaces
    cleaned_trn := regexp_replace(p_trn, '[^0-9]', '', 'g');
    -- Check if length is exactly 9 digits
    IF length(cleaned_trn) = 9 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Function: Process Wallet Deposit & Enforce CBE Limits
CREATE OR REPLACE FUNCTION process_wallet_deposit(
    p_wallet_id UUID,
    p_amount NUMERIC,
    p_channel VARCHAR,
    p_reference_number VARCHAR
)
RETURNS JSONB AS $$
DECLARE
    v_wallet RECORD;
    v_taxpayer RECORD;
    v_cbe_limit RECORD;
    v_remaining_daily NUMERIC(15, 2);
    v_remaining_monthly NUMERIC(15, 2);
    v_txn_id UUID;
BEGIN
    -- Fetch wallet
    SELECT * INTO v_wallet FROM wallets WHERE id = p_wallet_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet ID % not found', p_wallet_id;
    END IF;

    -- Fetch taxpayer and associated CBE limit
    SELECT t.*, c.daily_cap_egp, c.monthly_cap_egp, c.label AS tier_label 
    INTO v_taxpayer
    FROM taxpayers t
    JOIN cbe_limits c ON t.tier_level = c.tier_level
    WHERE t.id = v_wallet.taxpayer_id;

    -- Calculate remaining allowances
    v_remaining_daily := v_taxpayer.daily_cap_egp - v_wallet.daily_used_egp;
    v_remaining_monthly := v_taxpayer.monthly_cap_egp - v_wallet.monthly_used_egp;

    IF v_remaining_daily < 0 THEN v_remaining_daily := 0; END IF;
    IF v_remaining_monthly < 0 THEN v_remaining_monthly := 0; END IF;

    -- Check if deposit exceeds daily limit
    IF p_amount > v_remaining_daily THEN
        INSERT INTO wallet_transactions (wallet_id, amount_egp, channel, reference_number, status, failure_reason)
        VALUES (
            p_wallet_id,
            p_amount,
            p_channel,
            p_reference_number,
            'EXCEEDED_LIMIT',
            format('You attempted to deposit %s EGP, but your remaining daily allowance is %s EGP under %s rules.', 
                   to_char(p_amount, 'FM999,999.00'), 
                   to_char(v_remaining_daily, 'FM999,999.00'), 
                   v_taxpayer.tier_label)
        )
        RETURNING id INTO v_txn_id;

        RETURN jsonb_build_object(
            'success', false,
            'code', 'DAILY_LIMIT_EXCEEDED',
            'transaction_id', v_txn_id,
            'attempted_amount', p_amount,
            'remaining_daily_allowance', v_remaining_daily,
            'daily_cap', v_taxpayer.daily_cap_egp,
            'tier_level', v_taxpayer.tier_level,
            'message', format('You attempted to deposit %s EGP, but your remaining daily allowance is %s EGP under %s rules.', 
                              to_char(p_amount, 'FM999,999.00'), 
                              to_char(v_remaining_daily, 'FM999,999.00'), 
                              v_taxpayer.tier_label)
        );
    END IF;

    -- Check if deposit exceeds monthly limit
    IF p_amount > v_remaining_monthly THEN
        INSERT INTO wallet_transactions (wallet_id, amount_egp, channel, reference_number, status, failure_reason)
        VALUES (
            p_wallet_id,
            p_amount,
            p_channel,
            p_reference_number,
            'EXCEEDED_LIMIT',
            format('You attempted to deposit %s EGP, but your remaining monthly allowance is %s EGP under %s rules.', 
                   to_char(p_amount, 'FM999,999.00'), 
                   to_char(v_remaining_monthly, 'FM999,999.00'), 
                   v_taxpayer.tier_label)
        )
        RETURNING id INTO v_txn_id;

        RETURN jsonb_build_object(
            'success', false,
            'code', 'MONTHLY_LIMIT_EXCEEDED',
            'transaction_id', v_txn_id,
            'attempted_amount', p_amount,
            'remaining_monthly_allowance', v_remaining_monthly,
            'monthly_cap', v_taxpayer.monthly_cap_egp,
            'tier_level', v_taxpayer.tier_level,
            'message', format('You attempted to deposit %s EGP, but your remaining monthly allowance is %s EGP under %s rules.', 
                              to_char(p_amount, 'FM999,999.00'), 
                              to_char(v_remaining_monthly, 'FM999,999.00'), 
                              v_taxpayer.tier_label)
        );
    END IF;

    -- Deposit is valid: Update wallet balances
    UPDATE wallets
    SET balance = balance + p_amount,
        daily_used_egp = daily_used_egp + p_amount,
        monthly_used_egp = monthly_used_egp + p_amount
    WHERE id = p_wallet_id;

    -- Record completed transaction
    INSERT INTO wallet_transactions (wallet_id, amount_egp, channel, reference_number, status)
    VALUES (p_wallet_id, p_amount, p_channel, p_reference_number, 'COMPLETED')
    RETURNING id INTO v_txn_id;

    SELECT balance, daily_used_egp, monthly_used_egp INTO v_wallet FROM wallets WHERE id = p_wallet_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_txn_id,
        'new_balance', v_wallet.balance,
        'daily_used_egp', v_wallet.daily_used_egp,
        'monthly_used_egp', v_wallet.monthly_used_egp,
        'message', 'Wallet deposit processed successfully'
    );
END;
$$ LANGUAGE plpgsql;
