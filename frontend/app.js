// ETA Compliance SaaS Frontend Interactive Application Logic

function switchTab(tabId) {
  // Update nav buttons
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  // Find matching tab button
  const activeBtn = Array.from(buttons).find(btn => btn.getAttribute('onclick')?.includes(tabId));
  if (activeBtn) activeBtn.classList.add('active');

  // Hide all view sections
  const sections = document.querySelectorAll('.view-section');
  sections.forEach(sec => sec.classList.remove('active'));

  // Show target section
  const target = document.getElementById(`view-${tabId}`);
  if (target) target.classList.add('active');
}

function promptDeposit() {
  const amountStr = prompt('Enter deposit amount in EGP:', '25000');
  if (!amountStr) return;
  
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid deposit amount.');
    return;
  }

  // Current state simulation: Daily cap 60,000, Used 45,000 -> Remaining 15,000
  const remainingDaily = 15000;

  if (amount > remainingDaily) {
    // Update limit modal text dynamically
    const msgEl = document.getElementById('limit-modal-msg');
    if (msgEl) {
      msgEl.innerText = `You attempted to deposit ${amount.toLocaleString('en-US', {minimumFractionDigits: 2})} EGP, but your remaining daily allowance is ${remainingDaily.toLocaleString('en-US', {minimumFractionDigits: 2})} EGP under Tier 1 rules.`;
    }
    switchTab('limit-modal');
  } else {
    alert(`Deposit of ${amount.toLocaleString('en-US', {minimumFractionDigits: 2})} EGP completed successfully!`);
  }
}

function openDepositChannel(channelName) {
  const amountStr = prompt(`[${channelName}] Enter deposit amount (EGP):`, '10000');
  if (!amountStr) return;
  const amount = parseFloat(amountStr);
  if (amount > 15000) {
    switchTab('limit-modal');
  } else {
    alert(`Deposit of ${amount.toLocaleString('en-US')} EGP via ${channelName} succeeded!`);
  }
}

function upgradeToTier2() {
  alert('Redirecting to Tier 2 Commercial Registry & Tax ID Verification Portal...');
  switchTab('wallet');
}

function adjustAmount(newAmount) {
  alert(`Amount adjusted to ${newAmount.toLocaleString()} EGP. Proceeding with deposit...`);
  switchTab('wallet');
}

function validateTRN() {
  const input = document.getElementById('trn-input').value.trim();
  const digitsOnly = input.replace(/[^0-9]/g, '');
  const resultEl = document.getElementById('trn-result-msg');

  if (digitsOnly.length === 9) {
    resultEl.style.color = '#059669';
    resultEl.innerText = `Validation Status: ✅ Valid 9-digit Egyptian TRN format (${digitsOnly.slice(0,3)}-${digitsOnly.slice(3,6)}-${digitsOnly.slice(6,9)})`;
  } else {
    resultEl.style.color = '#dc2626';
    resultEl.innerText = `Validation Status: ❌ Invalid TRN length (${digitsOnly.length} digits). Must be strictly 9 digits.`;
  }
}

function downloadPdf() {
  alert('Downloading Official ETA Cleared & Verified E-Receipt PDF (INV-2026-001)...');
}

function emailReceipt() {
  alert('E-Receipt sent to taxpayer email: finance@nexus-wallet.eg');
}

function openEtaPortal() {
  window.open('https://invoicing.eta.gov.eg/receipts/search/E3A8F92D-811C-4B2E-901B-74D3F9A08123', '_blank');
}

function fetchFeed() {
  alert('Feed refreshed from backend GraphQL API.');
}
