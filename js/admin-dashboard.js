const commissionForm = document.getElementById('commissionForm');
const commissionInput = document.getElementById('commissionRateInput');
const previewText = document.getElementById('commissionPreviewText');
const currentRateCaption = document.getElementById('currentRateCaption');

function calculateCommissionPreview() {
  const rate = parseFloat(commissionInput.value) || 0;
  const exampleBooking = 2000;

  const platformFee = (exampleBooking * rate) / 100;
  const netEarnings = exampleBooking - platformFee;

  previewText.textContent =
    'Example ৳2,000 Booking → Platform Fee: ৳' +
    platformFee +
    ' | Host/Guide Net Earnings: ৳' +
    netEarnings;
}

if (commissionInput) {
  commissionInput.addEventListener('input', calculateCommissionPreview);
}

if (commissionForm) {
  commissionForm.addEventListener('submit', function (event) {
    event.preventDefault();
    calculateCommissionPreview();
    currentRateCaption.textContent =
      'Current rate: ' +
      commissionInput.value +
      '% · Applied to new bookings after the rate is updated.';
  });
}

const approveButtons = document.querySelectorAll('.btn-verify-approve');
for (let i = 0; i < approveButtons.length; i++) {
  approveButtons[i].addEventListener('click', function () {
    const row = approveButtons[i].closest('tr');
    row.querySelector('.verification-status-cell').innerHTML =
      '<span class="badge badge-approved">Approved</span>';
  });
}

const rejectButtons = document.querySelectorAll('.btn-verify-reject');
for (let i = 0; i < rejectButtons.length; i++) {
  rejectButtons[i].addEventListener('click', function () {
    const row = rejectButtons[i].closest('tr');
    row.querySelector('.verification-status-cell').innerHTML =
      '<span class="badge badge-rejected">Rejected</span>';
  });
}

const resolveTravelerBtn = document.getElementById('resolveTravelerBtn');
const resolveHostBtn = document.getElementById('resolveHostBtn');
const disputeStatusBadge = document.getElementById('detailDisputeStatusBadge');
const disputeResolutionNote = document.getElementById('disputeResolutionNote');

if (resolveTravelerBtn) {
  resolveTravelerBtn.addEventListener('click', function () {
    disputeStatusBadge.textContent = 'Resolved · Refunded';
    disputeStatusBadge.className = 'badge badge-approved';
    disputeResolutionNote.textContent =
      'Decision recorded: Resolved for Traveler (Refund).';
  });
}

if (resolveHostBtn) {
  resolveHostBtn.addEventListener('click', function () {
    disputeStatusBadge.textContent = 'Resolved · Payout';
    disputeStatusBadge.className = 'badge badge-approved';
    disputeResolutionNote.textContent =
      'Decision recorded: Resolved for Host/Guide (Payout).';
  });
}