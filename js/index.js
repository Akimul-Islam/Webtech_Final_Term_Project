/**
 * ============================================================================
 * HOMEPAGE JAVASCRIPT (js/index.js)
 * Used by: index.html
 * Description:
 * Filters the Featured Homestays & Tours cards when the user searches by
 * destination or category.
 * ============================================================================
 */

const searchForm = document.getElementById('homeSearchForm');
const destinationInput = document.getElementById('searchDestination');
const categorySelect = document.getElementById('searchCategory');
const cards = document.querySelectorAll('.listing-card');

if (searchForm) {
  searchForm.addEventListener('submit', function (event) {
    // Prevent page reload so JavaScript can filter cards on the screen
    event.preventDefault();

    const searchText = destinationInput.value.trim().toLowerCase();
    const selectedCategory = categorySelect.value;

    // Loop through each card and show or hide it
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardCategory = card.getAttribute('data-category');
      const cardTitle = card.getAttribute('data-title').toLowerCase();
      const cardLocation = card.getAttribute('data-location').toLowerCase();

      const categoryMatch =
        selectedCategory === 'all' || cardCategory === selectedCategory;
      const textMatch =
        searchText === '' ||
        cardTitle.includes(searchText) ||
        cardLocation.includes(searchText);

      if (categoryMatch && textMatch) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    }
  });
}
