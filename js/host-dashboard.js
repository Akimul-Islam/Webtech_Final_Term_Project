/**
 * ============================================================================
 * HOST DASHBOARD JAVASCRIPT (js/host-dashboard.js)
 * Used by: host-dashboard.html
 * Description:
 * Simple client-side interactivity for:
 *   1. Dynamic Seasonal Pricing (validates form and adds rule to list)
 *   2. Flexible Booking Management (Instant Booking toggle & Accept/Reject)
 * ============================================================================
 */

/* --------------------------------------------------------------------------
   1. DYNAMIC SEASONAL PRICING
   -------------------------------------------------------------------------- */
const seasonalForm = document.getElementById('seasonalPricingForm');
const rulesList = document.getElementById('seasonalRulesList');

if (seasonalForm) {
  seasonalForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const seasonType = document.getElementById('seasonTypeSelect').value;
    const price = document.getElementById('seasonalPriceInput').value.trim();
    const startDate = document.getElementById('seasonStartDate').value.trim();
    const endDate = document.getElementById('seasonEndDate').value.trim();

    if (price === '' || startDate === '' || endDate === '') {
      alert('Please enter the price, start date, and end date.');
      return;
    }

    const newRule = document.createElement('div');
    newRule.className = 'seasonal-rule-item';
    newRule.innerHTML =
      '<div>' +
      '  <div class="cell-primary" style="font-size: 0.85rem;">' + seasonType + '</div>' +
      '  <div class="cell-secondary">' + startDate + ' &ndash; ' + endDate + '</div>' +
      '</div>' +
      '<div class="text-right">' +
      '  <div class="cell-primary" style="font-size: 0.9rem;">৳' + price + '</div>' +
      '  <div class="cell-secondary">/ night</div>' +
      '</div>';

    rulesList.appendChild(newRule);
  });
}

/* --------------------------------------------------------------------------
   2. FLEXIBLE BOOKING MANAGEMENT (Instant Booking Toggle & Accept/Reject)
   -------------------------------------------------------------------------- */
const instantToggle = document.getElementById('instantBookingToggle');
const instantStateText = document.getElementById('instantBookingStateText');

if (instantToggle) {
  instantToggle.addEventListener('click', function () {
    const isOn = instantToggle.classList.toggle('active');
    instantStateText.textContent = isOn ? 'On' : 'Off';
  });
}

// Accept buttons
const acceptButtons = document.querySelectorAll('.btn-host-accept');
for (let i = 0; i < acceptButtons.length; i++) {
  acceptButtons[i].addEventListener('click', function () {
    const row = acceptButtons[i].closest('tr');
    row.querySelector('.request-status-cell').innerHTML =
      '<span class="badge badge-approved">Confirmed</span>';
  });
}

// Reject buttons
const rejectButtons = document.querySelectorAll('.btn-host-reject');
for (let i = 0; i < rejectButtons.length; i++) {
  rejectButtons[i].addEventListener('click', function () {
    const row = rejectButtons[i].closest('tr');
    row.querySelector('.request-status-cell').innerHTML =
      '<span class="badge badge-rejected">Rejected</span>';
  });
}
