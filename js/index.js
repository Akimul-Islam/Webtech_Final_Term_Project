const searchForm = document.getElementById('homeSearchForm');
const destinationInput = document.getElementById('searchDestination');
const categorySelect = document.getElementById('searchCategory');
const cards = document.querySelectorAll('.listing-card');

if (searchForm) {
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const searchText = destinationInput.value.trim().toLowerCase();
    const selectedCategory = categorySelect.value;

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
