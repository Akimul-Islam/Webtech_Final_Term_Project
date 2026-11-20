
const requestRows = document.querySelectorAll('#tourBidRequestsBody tr');
const bidTargetSummary = document.getElementById('bidTargetSummary');
const bidProposedPrice = document.getElementById('bidProposedPrice');
const bidProposedItinerary = document.getElementById('bidProposedItinerary');
const submitTourBidForm = document.getElementById('submitTourBidForm');

for (let i = 0; i < requestRows.length; i++) {
  requestRows[i].addEventListener('click', function () {
    for (let j = 0; j < requestRows.length; j++) {
      requestRows[j].classList.remove('row-selected');
      requestRows[j].querySelector('input[type="radio"]').checked = false;
    }
    const row = requestRows[i];
    row.classList.add('row-selected');
    row.querySelector('input[type="radio"]').checked = true;

    const traveler = row.getAttribute('data-traveler');
    const destination = row.getAttribute('data-destination');
    const date = row.getAttribute('data-date');
    const group = row.getAttribute('data-group');

    bidTargetSummary.textContent =
      'For ' + traveler + ' · ' + destination + ' · ' + date + ' · ' + group;
    bidProposedPrice.value = row.getAttribute('data-price');
    bidProposedItinerary.value = row.getAttribute('data-itinerary');
  });
}

if (submitTourBidForm) {
  submitTourBidForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (bidProposedPrice.value.trim() === '' || bidProposedItinerary.value.trim() === '') {
      alert('Please enter a proposed price and itinerary details.');
      return;
    }

    bidTargetSummary.textContent =
      'Bid of ৳' + bidProposedPrice.value + ' sent! (Ready for PHP database save)';
  });
}

const updateStatusButtons = document.querySelectorAll('.btn-save-tour-status');
const tourProgressFeedback = document.getElementById('tourProgressFeedback');

for (let i = 0; i < updateStatusButtons.length; i++) {
  updateStatusButtons[i].addEventListener('click', function () {
    const row = updateStatusButtons[i].closest('tr');
    const tourTitle = row.cells[0].textContent;
    const selectedStatus = row.querySelector('.tour-status-select').value;

    tourProgressFeedback.textContent =
      'Saved: "' + tourTitle + '" status updated to ' + selectedStatus + '.';
  });
}

const portfolioForm = document.getElementById('guidePortfolioForm');
const portfolioSubmitHint = document.getElementById('portfolioSubmitHint');

if (portfolioForm) {
  portfolioForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const experience = document.getElementById('guideExperienceInput').value.trim();
    if (experience === '') {
      alert('Please describe your previous guiding experience.');
      return;
    }

    portfolioSubmitHint.textContent =
      'Portfolio validated and ready to submit to Admin via PHP.';
  });
}
