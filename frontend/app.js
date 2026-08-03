// ETA Compliance SaaS Frontend Interactive Application Logic

const sampleTransactions = {
  'TXN-2026-001': {
    refId: 'TXN-2026-001',
    date: '03 Aug 2026, 11:30 AM',
    channel: 'InstaPay Egypt',
    refNum: 'INSTA-99410-EG',
    status: 'COMPLETED',
    statusClass: 'status-completed',
    amount: '20,000.00 EGP',
    fee: '0.00 EGP',
    vat: '0.00 EGP',
    total: '+20,000.00 EGP',
    cbeImpact: 'Updated Daily Used: 20,000 / 60,000 EGP (33% of Tier 1 Cap)',
    isFailure: false
  },
  'TXN-2026-002': {
    refId: 'TXN-2026-002',
    date: '03 Aug 2026, 01:15 PM',
    channel: 'Fawry Cash Code',
    refNum: 'FAWRY-48192-EG',
    status: 'COMPLETED',
    statusClass: 'status-completed',
    amount: '25,000.00 EGP',
    fee: '100.00 EGP',
    vat: '14.00 EGP',
    total: '+25,000.00 EGP',
    cbeImpact: 'Updated Daily Used: 45,000 / 60,000 EGP (75% of Tier 1 Cap)',
    isFailure: false
  },
  'TXN-2026-003': {
    refId: 'TXN-2026-003',
    date: '03 Aug 2026, 02:45 PM',
    channel: 'Credit / Debit Card',
    refNum: 'CARD-88192-EG',
    status: 'EXCEEDED_LIMIT',
    statusClass: 'status-exceeded',
    amount: '25,000.00 EGP',
    fee: '0.00 EGP',
    vat: '0.00 EGP',
    total: '0.00 EGP (Rejected)',
    cbeImpact: '⚠️ Rejected: You attempted to deposit 25,000.00 EGP, but your remaining daily allowance is 15,000.00 EGP under Tier 1 rules.',
    isFailure: true
  },
  'TXN-2026-004': {
    refId: 'TXN-2026-004',
    date: '02 Aug 2026, 04:00 PM',
    channel: 'Bank Wire Transfer',
    refNum: 'BANK-CIB-90182',
    status: 'COMPLETED',
    statusClass: 'status-completed',
    amount: '10,000.00 EGP',
    fee: '50.00 EGP',
    vat: '7.00 EGP',
    total: '+10,000.00 EGP',
    cbeImpact: 'Updated Monthly Used: 110,000 / 200,000 EGP (55% of Monthly Cap)',
    isFailure: false
  }
};

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

function fetchTransactions() {
  alert('Transaction history refreshed from database.');
}

// Transaction Detail Modal Handlers
function openTxnDetailModal(refId) {
  const data = sampleTransactions[refId] || {
    refId,
    date: new Date().toLocaleString(),
    channel: 'InstaPay Egypt',
    refNum: 'INSTA-MOCK-99',
    status: 'COMPLETED',
    statusClass: 'status-completed',
    amount: '10,000.00 EGP',
    fee: '0.00 EGP',
    vat: '0.00 EGP',
    total: '+10,000.00 EGP',
    cbeImpact: 'Processed successfully within CBE Tier 1 cap',
    isFailure: false
  };

  document.getElementById('dtl-ref-id').innerText = data.refId;
  document.getElementById('dtl-date').innerText = data.date;
  document.getElementById('dtl-channel').innerText = data.channel;
  document.getElementById('dtl-ref-num').innerText = data.refNum;
  document.getElementById('dtl-amount').innerText = data.amount;
  document.getElementById('dtl-fee').innerText = data.fee;
  document.getElementById('dtl-vat').innerText = data.vat;
  document.getElementById('dtl-total').innerText = data.total;
  document.getElementById('dtl-cbe-text').innerText = data.cbeImpact;

  const badge = document.getElementById('dtl-status-badge');
  badge.innerText = data.status;
  badge.className = `status-badge ${data.statusClass}`;

  const cbeBox = document.getElementById('dtl-cbe-impact-box');
  if (data.isFailure) {
    cbeBox.style.background = '#fef2f2';
    cbeBox.style.borderColor = '#fca5a5';
    cbeBox.style.color = '#991b1b';
  } else {
    cbeBox.style.background = '#eff6ff';
    cbeBox.style.borderColor = '#bfdbfe';
    cbeBox.style.color = '#1e40af';
  }

  document.getElementById('txn-detail-modal-overlay').style.display = 'flex';
}

function closeTxnModal() {
  document.getElementById('txn-detail-modal-overlay').style.display = 'none';
}

// Account & Preferences Functions
function saveAccountPreferences(event) {
  event.preventDefault();
  const legalName = document.getElementById('acc-legal-name').value;
  const email = document.getElementById('acc-email').value;
  const language = document.getElementById('acc-language').value;
  
  alert(`Account preferences updated successfully!\nLegal Name: ${legalName}\nEmail: ${email}\nLanguage: ${language}`);
}

// Integration Functions
function testEtaConnection() {
  const statusBox = document.getElementById('test-connection-status');
  statusBox.style.display = 'block';
  statusBox.style.background = '#fef9c3';
  statusBox.style.color = '#854d0e';
  statusBox.innerText = '⏳ Authenticating with Egyptian Tax Authority (ETA) e-Invoicing API Gateway...';

  setTimeout(() => {
    statusBox.style.background = '#dcfce7';
    statusBox.style.color = '#15803d';
    statusBox.innerText = '⚡ Connection Successful! Latency: 42ms | Verified OAuth2 Token & Active e-Seal Certificate (CAdES-BES).';
  }, 800);
}

function connectIntegration(name) {
  alert(`Initiating OAuth2 handshake for ${name}...`);
}

function copyApiKey() {
  navigator.clipboard.writeText('nx_live_key_9841a0e7f229');
  alert('API Key copied to clipboard!');
}

function saveIntegrationConfig() {
  const env = document.getElementById('int-eta-env').value;
  const webhook = document.getElementById('int-webhook-url').value;
  alert(`Integration settings saved successfully!\nEnvironment: ${env}\nWebhook: ${webhook}`);
}
