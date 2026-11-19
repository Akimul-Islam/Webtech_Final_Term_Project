/**
 * ============================================================================
 * TRAVELER DASHBOARD JAVASCRIPT (js/traveler-dashboard.js)
 * Used by: traveler-dashboard.html
 * Description:
 * Implements the 3 core JavaScript features for the Traveler Dashboard:
 *   1. Smart Itinerary Builder (DOM manipulation to add/remove items)
 *   2. Split Cost Calculator (Calculates Total Trip Cost & Cost Per Person)
 *   3. AJAX Booking Negotiation (Adds message & offer without page reload)
 * ============================================================================
 */

const timeline = document.getElementById('itineraryTimeline');
const addItineraryForm = document.getElementById('addItineraryForm');
const savedListingSelect = document.getElementById('savedListingSelect');
const dayInput = document.getElementById('itineraryDayInput');

const homestaysTotalInput = document.getElementById('homestaysTotalInput');
const toursTotalInput = document.getElementById('toursTotalInput');
const participantsInput = document.getElementById('participantsInput');
const totalTripCostDisplay = document.getElementById('totalTripCostDisplay');
const costPerPersonDisplay = document.getElementById('costPerPersonDisplay');

/* --------------------------------------------------------------------------
   FEATURE 3: SPLIT COST CALCULATOR
   Calculates Total Cost and Cost Per Person (৳) whenever numbers change.
   -------------------------------------------------------------------------- */
function calculateSplitCost() {
  const homestaysTotal = parseFloat(homestaysTotalInput.value) || 0;
  const toursTotal = parseFloat(toursTotalInput.value) || 0;
  let participants = parseInt(participantsInput.value, 10) || 1;

  if (participants < 1) {
    participants = 1;
  }

  const totalCost = homestaysTotal + toursTotal;
  const perPerson = totalCost / participants;

  totalTripCostDisplay.textContent = '৳' + totalCost.toFixed(2);
  costPerPersonDisplay.textContent = perPerson.toFixed(2);
}

// Recalculate totals from the items currently in the itinerary list
function updateItineraryTotals() {
  const items = timeline.querySelectorAll('.itinerary-item');
  let homestaySum = 0;
  let tourSum = 0;

  for (let i = 0; i < items.length; i++) {
    const itemType = items[i].getAttribute('data-type');
    const itemPrice = parseFloat(items[i].getAttribute('data-price')) || 0;

    if (itemType === 'Homestay') {
      homestaySum = homestaySum + itemPrice;
    } else {
      tourSum = tourSum + itemPrice;
    }
  }

  homestaysTotalInput.value = homestaySum.toFixed(2);
  toursTotalInput.value = tourSum.toFixed(2);
  calculateSplitCost();
}

// Listen for manual changes in the Split Cost Calculator inputs
homestaysTotalInput.addEventListener('input', calculateSplitCost);
toursTotalInput.addEventListener('input', calculateSplitCost);
participantsInput.addEventListener('input', calculateSplitCost);

/* --------------------------------------------------------------------------
   FEATURE 1: SMART ITINERARY BUILDER (DOM MANIPULATION)
   Adds new items to the itinerary list and removes items when clicked.
   -------------------------------------------------------------------------- */
function attachRemoveEvent(button) {
  button.addEventListener('click', function () {
    const itemRow = button.closest('.itinerary-item');
    if (itemRow) {
      itemRow.remove();
      updateItineraryTotals();
    }
  });
}

// Attach remove events to initial items
const removeButtons = document.querySelectorAll('.btn-remove-itinerary');
for (let i = 0; i < removeButtons.length; i++) {
  attachRemoveEvent(removeButtons[i]);
}

// Add new item when "+ Add to Itinerary" is clicked
if (addItineraryForm) {
  addItineraryForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // Option value format: "Title|Type|Details|Price"
    const parts = savedListingSelect.value.split('|');
    const title = parts[0];
    const type = parts[1];
    const details = parts[2];
    const price = parseFloat(parts[3]) || 0;
    const dayNumber = parseInt(dayInput.value, 10) || 1;

    const badgeClass = type === 'Homestay' ? 'badge-info' : 'badge-neutral';

    // Create new itinerary row element
    const newItem = document.createElement('div');
    newItem.className = 'itinerary-item';
    newItem.setAttribute('data-day', dayNumber);
    newItem.setAttribute('data-type', type);
    newItem.setAttribute('data-price', price);

    newItem.innerHTML =
      '<span class="day-pill">Day ' + dayNumber + '</span>' +
      '<div>' +
      '  <div class="itinerary-info-title">' + title + '</div>' +
      '  <div class="itinerary-info-meta">' +
      '    <span class="badge ' + badgeClass + '">' + type + '</span>' +
      '    <span>' + details + '</span>' +
      '  </div>' +
      '</div>' +
      '<div class="itinerary-price">৳' + price.toFixed(2) + '</div>' +
      '<button type="button" class="btn btn-remove btn-remove-itinerary">Remove</button>';

    timeline.appendChild(newItem);

    // Attach remove button listener and recalculate totals
    const newRemoveBtn = newItem.querySelector('.btn-remove-itinerary');
    attachRemoveEvent(newRemoveBtn);
    updateItineraryTotals();
  });
}

/* --------------------------------------------------------------------------
   FEATURE 2: AJAX BOOKING NEGOTIATION
   Sends the traveler's message and offer price (৳) into the chat box
   asynchronously without reloading the page.
   -------------------------------------------------------------------------- */
const ajaxForm = document.getElementById('ajaxNegotiationForm');
const messageInput = document.getElementById('negotiationMessageInput');
const offerInput = document.getElementById('negotiationOfferInput');
const chatMessagesContainer = document.getElementById('chatMessagesContainer');

if (ajaxForm) {
  ajaxForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const messageText = messageInput.value.trim();
    const offerPrice = parseFloat(offerInput.value) || 0;

    if (messageText === '' || offerPrice <= 0) {
      return;
    }

    // Create new outgoing message bubble in the chat container
    const newBubble = document.createElement('div');
    newBubble.className = 'chat-bubble-wrap outgoing';
    newBubble.innerHTML =
      '<div class="chat-bubble">' +
      messageText +
      ' <strong>(Offer: ৳' + offerPrice.toFixed(2) + ')</strong>' +
      '</div>' +
      '<div class="chat-timestamp">You &middot; Just now</div>';

    chatMessagesContainer.appendChild(newBubble);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    // Clear message input after sending
    messageInput.value = '';
  });
}
