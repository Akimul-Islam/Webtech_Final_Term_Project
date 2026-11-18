/**
 * ============================================================================
 * LOCAL NEST - PURE VANILLA JAVASCRIPT (NO FRAMEWORKS)
 * Project: Local Nest - Integrated Homestay & Local Experience Booking Platform
 * Course: CSC 3215: Web Technologies (AIUB)
 *
 * Description:
 * This file implements all client-side interactivity, DOM manipulation, form
 * validation, dynamic calculations, and simulated AJAX requests across all
 * 8 pages of the Local Nest platform using pure ES6+ JavaScript.
 *
 * How PHP & MySQL Will Connect Later:
 * Where data is currently read/updated in memory or localStorage, comments
 * explain how a PHP endpoint (via form POST or fetch() AJAX) will interact
 * with the MySQL database tables defined in the ER Diagram.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', function () {
  const currentPage = document.body.getAttribute('data-page');

  // Initialize shared logout behavior across all dashboard pages
  initLogoutLinks();

  // Route initialization based on which HTML page is currently loaded
  switch (currentPage) {
    case 'home':
      initHomePage();
      break;
    case 'login':
      initLoginPage();
      break;
    case 'register':
      initRegisterPage();
      break;
    case 'profile':
      initProfilePage();
      break;
    case 'traveler-dashboard':
      initTravelerDashboard();
      break;
    case 'host-dashboard':
      initHostDashboard();
      break;
    case 'guide-dashboard':
      initGuideDashboard();
      break;
    case 'admin-dashboard':
      initAdminDashboard();
      break;
    default:
      break;
  }
});

/* ============================================================================
   HELPER UTILITIES
   Format currency numbers and compute user initials from a full name.
   ============================================================================ */

/**
 * Formats a number as a 2-decimal currency string (e.g., 4320 -> "4,320.00").
 */
function formatCurrency(amount) {
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Extracts 2-letter uppercase initials from a user's full name, ignoring
 * honorific prefixes such as "MD." or "Md.".
 */
function getInitials(fullName) {
  if (!fullName) return 'LN';
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(function (part) {
      return !/^md\.?$/i.test(part);
    });
  if (parts.length === 0) return 'LN';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Returns the dashboard filename corresponding to a user role.
 */
function getDashboardUrlByRole(role) {
  const normalized = (role || '').toLowerCase();
  if (normalized.includes('host')) return 'host-dashboard.html';
  if (normalized.includes('guide')) return 'guide-dashboard.html';
  if (normalized.includes('admin')) return 'admin-dashboard.html';
  return 'traveler-dashboard.html';
}

/**
 * Clears active user session state on Logout click.
 */
function initLogoutLinks() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      // Future PHP Note: Point this link to logout.php which calls session_destroy()
      localStorage.removeItem('localnest_active_user');
    });
  }
}

/* ============================================================================
   PAGE 1: PUBLIC HOMEPAGE (index.html)
   Handles search filtering by destination/category and the View/Book modal.
   ============================================================================ */
function initHomePage() {
  const searchForm = document.getElementById('homeSearchForm');
  const destInput = document.getElementById('searchDestination');
  const dateInput = document.getElementById('searchDate');
  const categorySelect = document.getElementById('searchCategory');
  const listingsGrid = document.getElementById('listingsGrid');
  const statusText = document.getElementById('featuredFilterStatus');
  const resetBtn = document.getElementById('resetFilterBtn');
  const navFilterLinks = document.querySelectorAll('[data-nav-filter]');

  if (!listingsGrid) return;
  const cards = Array.from(listingsGrid.querySelectorAll('.listing-card'));

  /**
   * Filters the 6 featured cards based on destination text and category.
   */
  function applyListingFilters() {
    const query = (destInput.value || '').trim().toLowerCase();
    const category = categorySelect.value;
    let visibleCount = 0;

    cards.forEach(function (card) {
      const cardCat = card.getAttribute('data-category');
      const cardTitle = (card.getAttribute('data-title') || '').toLowerCase();
      const cardLocation = (card.getAttribute('data-location') || '').toLowerCase();

      const matchesCategory = category === 'all' || cardCat === category;
      const matchesQuery =
        !query || cardTitle.includes(query) || cardLocation.includes(query);

      if (matchesCategory && matchesQuery) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update subtitle and Reset button visibility
    const isFiltered = query !== '' || category !== 'all' || dateInput.value !== '';
    if (isFiltered) {
      resetBtn.style.display = 'inline-flex';
      statusText.textContent =
        'Showing ' +
        visibleCount +
        ' of ' +
        cards.length +
        ' verified experiences matching your filter.';
    } else {
      resetBtn.style.display = 'none';
      statusText.textContent =
        'Thoughtfully chosen stays and experiences, brought to you by locals.';
    }
  }

  // Trigger filtering on search form submit and live input changes
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      applyListingFilters();
      document
        .getElementById('featuredSection')
        .scrollIntoView({ behavior: 'smooth' });
    });
  }

  destInput.addEventListener('input', applyListingFilters);
  categorySelect.addEventListener('change', applyListingFilters);

  // Reset filters button
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      destInput.value = '';
      dateInput.value = '';
      dateInput.type = 'text';
      categorySelect.value = 'all';
      navFilterLinks.forEach(function (lnk) {
        lnk.classList.toggle('active', lnk.getAttribute('data-nav-filter') === 'all');
      });
      applyListingFilters();
    });
  }

  // Top navbar & footer category filter links (Home / Homestays / Local Tours)
  navFilterLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      const filterType = link.getAttribute('data-nav-filter');
      categorySelect.value = filterType;
      navFilterLinks.forEach(function (item) {
        item.classList.toggle(
          'active',
          item.getAttribute('data-nav-filter') === filterType
        );
      });
      applyListingFilters();
    });
  });

  // Interactive "View / Book" Modal
  const modal = document.getElementById('listingModal');
  const modalCategory = document.getElementById('modalListingCategory');
  const modalTitle = document.getElementById('modalListingTitle');
  const modalLocation = document.getElementById('modalListingLocation');
  const modalPrice = document.getElementById('modalListingPrice');
  const closeModalBtn = document.getElementById('closeListingModal');
  const cancelModalBtn = document.getElementById('modalCancelBtn');

  document.querySelectorAll('.btn-view-book').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const card = btn.closest('.listing-card');
      if (!card || !modal) return;

      const title = card.getAttribute('data-title');
      const category = card.getAttribute('data-category');
      const location = card.getAttribute('data-location');
      const price = card.getAttribute('data-price');
      const unit = card.getAttribute('data-unit');

      modalCategory.textContent = category;
      modalTitle.textContent = title;
      modalLocation.textContent = 'Location: ' + location + ' · Verified Local Partner';
      modalPrice.textContent = '৳' + price + ' / ' + unit;

      modal.classList.add('open');
    });
  });

  function closeListingModal() {
    if (modal) modal.classList.remove('open');
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeListingModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeListingModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeListingModal();
    });
  }
}

/* ============================================================================
   PAGE 2: LOGIN PAGE (login.html)
   Validates credentials, supports demo role quick-fill, and redirects by role.
   ============================================================================ */
function initLoginPage() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const statusBanner = document.getElementById('loginStatusBanner');
  const demoPills = document.querySelectorAll('[data-demo-role]');

  // Pre-configured demo accounts for all 4 roles using group member names
  const demoAccounts = {
    traveler: {
      name: 'MD. Akimul Islam',
      email: 'akimul.islam@example.com',
      role: 'Traveler',
      phone: '+880 1711-234567'
    },
    host: {
      name: 'Meherunnissa Ponni',
      email: 'meherunnissa.ponni@localnest.com',
      role: 'Homestay Host',
      phone: '+880 1812-345678'
    },
    guide: {
      name: 'Jemam Bin Islam',
      email: 'jemam.islam@localnest.com',
      role: 'Local Tour Guide',
      phone: '+880 1913-456789'
    },
    admin: {
      name: 'Rafid Tahasin',
      email: 'rafid.tahasin@localnest.com',
      role: 'Admin',
      phone: '+880 1614-567890'
    }
  };

  function showLoginMessage(text, type) {
    statusBanner.textContent = text;
    statusBanner.className = 'status-banner';
    if (type === 'error') statusBanner.classList.add('status-error');
    if (type === 'success') statusBanner.classList.add('status-success');
  }

  // Quick Demo Role Buttons (auto-fills email & password)
  demoPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      const roleKey = pill.getAttribute('data-demo-role');
      const account = demoAccounts[roleKey];
      if (!account) return;

      emailInput.value = account.email;
      passwordInput.value = 'password123';
      showLoginMessage(
        'Demo ' + account.role + ' (' + account.name + ') filled. Click "Log In" to continue.',
        'success'
      );
    });
  });

  // Handle Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Client-side validation
      if (!email || !password) {
        showLoginMessage('Please enter both your email address and password.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showLoginMessage('Please enter a valid email address.', 'error');
        return;
      }

      // Determine user role from email or saved registration
      let matchedUser = null;
      const savedUsers = JSON.parse(localStorage.getItem('localnest_users') || '[]');
      const foundRegistered = savedUsers.find(function (u) {
        return u.email.toLowerCase() === email.toLowerCase();
      });

      const lowerEmail = email.toLowerCase();
      if (foundRegistered) {
        matchedUser = foundRegistered;
      } else if (lowerEmail.includes('host') || lowerEmail.includes('meherunnissa') || lowerEmail.includes('ponni')) {
        matchedUser = demoAccounts.host;
      } else if (lowerEmail.includes('guide') || lowerEmail.includes('jemam')) {
        matchedUser = demoAccounts.guide;
      } else if (lowerEmail.includes('admin') || lowerEmail.includes('rafid')) {
        matchedUser = demoAccounts.admin;
      } else {
        matchedUser = {
          name: 'MD. Akimul Islam',
          email: email,
          role: 'Traveler',
          phone: '+880 1711-234567'
        };
      }

      // Save active user session in localStorage
      localStorage.setItem('localnest_active_user', JSON.stringify(matchedUser));

      const targetDashboard = getDashboardUrlByRole(matchedUser.role);
      showLoginMessage(
        'Login successful! Redirecting ' + matchedUser.name + ' to ' + matchedUser.role + ' dashboard...',
        'success'
      );

      setTimeout(function () {
        window.location.href = targetDashboard;
      }, 450);
    });
  }
}

/* ============================================================================
   PAGE 3: REGISTRATION PAGE (register.html)
   Validates inputs, registers role-based user, and redirects to dashboard.
   ============================================================================ */
function initRegisterPage() {
  const registerForm = document.getElementById('registerForm');
  const statusBanner = document.getElementById('registerStatusBanner');

  function showRegisterMessage(text, type) {
    statusBanner.style.display = 'block';
    statusBanner.textContent = text;
    statusBanner.className = 'status-banner';
    if (type === 'error') statusBanner.classList.add('status-error');
    if (type === 'success') statusBanner.classList.add('status-success');
  }

  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const fullName = document.getElementById('regFullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const role = document.getElementById('regRole').value;
      const password = document.getElementById('regPassword').value;
      const confirmPass = document.getElementById('regConfirmPassword').value;

      if (!fullName || !email || !password || !confirmPass) {
        showRegisterMessage('All fields are required to create an account.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showRegisterMessage('Please enter a valid email address.', 'error');
        return;
      }

      if (password.length < 8) {
        showRegisterMessage('Password must be at least 8 characters long.', 'error');
        return;
      }

      if (password !== confirmPass) {
        showRegisterMessage('Passwords do not match. Please re-enter.', 'error');
        return;
      }

      // Create user record in localStorage (simulating database INSERT into USER table)
      const roleLabel =
        role === 'Host'
          ? 'Homestay Host'
          : role === 'Guide'
          ? 'Local Tour Guide'
          : 'Traveler';

      const newUser = {
        name: fullName,
        email: email,
        role: roleLabel,
        phone: '+880 1711-234567'
      };

      const savedUsers = JSON.parse(localStorage.getItem('localnest_users') || '[]');
      savedUsers.push(newUser);
      localStorage.setItem('localnest_users', JSON.stringify(savedUsers));
      localStorage.setItem('localnest_active_user', JSON.stringify(newUser));

      showRegisterMessage(
        'Account created as ' + roleLabel + '! Redirecting to your dashboard...',
        'success'
      );

      setTimeout(function () {
        window.location.href = getDashboardUrlByRole(roleLabel);
      }, 500);
    });
  }
}

/* ============================================================================
   PAGE 4: ACCOUNT & PROFILE SETTINGS (profile-settings.html)
   Handles profile editing, live photo upload preview, and password reset.
   ============================================================================ */
function initProfilePage() {
  const activeUser = JSON.parse(
    localStorage.getItem('localnest_active_user') || 'null'
  ) || {
    name: 'MD. Akimul Islam',
    email: 'akimul.islam@example.com',
    role: 'Traveler',
    phone: '+880 1711-234567'
  };

  const topbarName = document.getElementById('topbarUserName');
  const topbarRole = document.getElementById('topbarUserRole');
  const topbarAvatar = document.getElementById('topbarAvatar');
  const previewAvatar = document.getElementById('profilePreviewAvatar');
  const backLink = document.getElementById('backToDashboardLink');

  const fullNameInput = document.getElementById('profileFullName');
  const emailInput = document.getElementById('profileEmail');
  const phoneInput = document.getElementById('profilePhone');
  const photoInput = document.getElementById('profilePhotoInput');
  const photoFileName = document.getElementById('profilePhotoFileName');

  // Populate fields from active user state
  function renderUserHeader(user) {
    const initials = getInitials(user.name);
    if (topbarName) topbarName.textContent = user.name;
    if (topbarRole) topbarRole.textContent = 'Role: ' + user.role;
    if (backLink) backLink.href = getDashboardUrlByRole(user.role);

    if (user.photoDataUrl) {
      topbarAvatar.innerHTML = '<img src="' + user.photoDataUrl + '" alt="Avatar" />';
      previewAvatar.innerHTML = '<img src="' + user.photoDataUrl + '" alt="Avatar" />';
    } else {
      topbarAvatar.textContent = initials;
      previewAvatar.textContent = initials;
    }
  }

  fullNameInput.value = activeUser.name;
  emailInput.value = activeUser.email;
  phoneInput.value = activeUser.phone || '+880 1711-234567';
  renderUserHeader(activeUser);

  // Handle Photo Upload Preview & 2 MB Size Check
  if (photoInput) {
    photoInput.addEventListener('change', function () {
      const file = photoInput.files[0];
      if (!file) return;

      const maxBytes = 2 * 1024 * 1024; // 2 MB
      if (file.size > maxBytes) {
        showBanner(
          'profileStatusBanner',
          'Selected image exceeds the 2 MB size limit. Please choose a smaller JPG/PNG.',
          'error'
        );
        photoInput.value = '';
        return;
      }

      photoFileName.textContent = file.name;
      const reader = new FileReader();
      reader.onload = function (ev) {
        activeUser.photoDataUrl = ev.target.result;
        renderUserHeader(activeUser);
      };
      reader.readAsDataURL(file);
    });
  }

  // Save Profile Changes Form
  const profileForm = document.getElementById('profileInfoForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const newName = fullNameInput.value.trim();
      const newEmail = emailInput.value.trim();
      const newPhone = phoneInput.value.trim();

      if (!newName || !newEmail) {
        showBanner('profileStatusBanner', 'Full Name and Email Address are required.', 'error');
        return;
      }

      activeUser.name = newName;
      activeUser.email = newEmail;
      activeUser.phone = newPhone;
      localStorage.setItem('localnest_active_user', JSON.stringify(activeUser));
      renderUserHeader(activeUser);

      showBanner(
        'profileStatusBanner',
        'Profile information saved! Your name and contact details have been updated.',
        'success'
      );
    });
  }

  // Change / Reset Password Form
  const passwordForm = document.getElementById('changePasswordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const currentPass = document.getElementById('currentPassword').value;
      const newPass = document.getElementById('newPassword').value;
      const confirmPass = document.getElementById('confirmNewPassword').value;

      if (!currentPass || !newPass || !confirmPass) {
        showBanner('passwordStatusBanner', 'Please complete all password fields.', 'error');
        return;
      }

      if (newPass.length < 8) {
        showBanner(
          'passwordStatusBanner',
          'New password must be at least 8 characters long.',
          'error'
        );
        return;
      }

      if (newPass !== confirmPass) {
        showBanner(
          'passwordStatusBanner',
          'New password and confirmation do not match.',
          'error'
        );
        return;
      }

      passwordForm.reset();
      showBanner(
        'passwordStatusBanner',
        'Your password has been securely updated.',
        'success'
      );
    });
  }

  function showBanner(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.style.display = 'block';
    el.textContent = message;
    el.className = 'status-banner ' + (type === 'error' ? 'status-error' : 'status-success');
  }
}

/* ============================================================================
   PAGE 5: TRAVELER (GUEST) DASHBOARD (traveler-dashboard.html)
   Implements:
     Feature 1: Smart Itinerary Builder (DOM creation, sorting, removal)
     Feature 2: AJAX Booking Negotiation (Async chat & price offers)
     Feature 3: Split Cost Calculator (Real-time group cost division)
   ============================================================================ */
function initTravelerDashboard() {
  const addItineraryForm = document.getElementById('addItineraryForm');
  const savedListingSelect = document.getElementById('savedListingSelect');
  const dayInput = document.getElementById('itineraryDayInput');
  const timeline = document.getElementById('itineraryTimeline');
  const itinerarySubtitle = document.getElementById('itinerarySummarySubtitle');

  const homestaysTotalInput = document.getElementById('homestaysTotalInput');
  const toursTotalInput = document.getElementById('toursTotalInput');
  const participantsInput = document.getElementById('participantsInput');
  const totalTripCostDisplay = document.getElementById('totalTripCostDisplay');
  const costPerPersonDisplay = document.getElementById('costPerPersonDisplay');
  const splitCostFootnote = document.getElementById('splitCostFootnote');

  /**
   * FEATURE 3: Recalculates Total Trip Cost and Cost Per Person (৳).
   */
  function updateSplitCostCalculator() {
    const homestaysTotal = parseFloat(homestaysTotalInput.value) || 0;
    const toursTotal = parseFloat(toursTotalInput.value) || 0;
    const participants = Math.max(1, parseInt(participantsInput.value, 10) || 1);

    const totalCost = homestaysTotal + toursTotal;
    const perPerson = totalCost / participants;

    totalTripCostDisplay.textContent = '৳' + formatCurrency(totalCost);
    costPerPersonDisplay.textContent = formatCurrency(perPerson);
    splitCostFootnote.textContent =
      'Based on listed prices for all ' +
      participants +
      (participants === 1 ? ' participant.' : ' participants.') +
      ' Negotiation offers are not included.';
  }

  /**
   * Syncs the Smart Itinerary Builder items with the Split Cost Calculator
   * and updates the itinerary header summary count.
   */
  function syncItineraryTotals() {
    const items = Array.from(timeline.querySelectorAll('.itinerary-item'));
    let staySum = 0;
    let tourSum = 0;
    const uniqueDays = new Set();

    items.forEach(function (item) {
      const price = parseFloat(item.getAttribute('data-price')) || 0;
      const type = item.getAttribute('data-type');
      const day = item.getAttribute('data-day');
      uniqueDays.add(day);

      if (type === 'Homestay') {
        staySum += price;
      } else {
        tourSum += price;
      }
    });

    homestaysTotalInput.value = staySum.toFixed(2);
    toursTotalInput.value = tourSum.toFixed(2);

    const dayCount = uniqueDays.size || 0;
    itinerarySubtitle.textContent =
      'Your Sylhet getaway · ' +
      dayCount +
      (dayCount === 1 ? ' day, ' : ' days, ') +
      items.length +
      (items.length === 1 ? ' saved experience.' : ' saved experiences.');

    updateSplitCostCalculator();
  }

  /**
   * Binds click event to a "Remove" button inside an itinerary item.
   */
  function bindRemoveItineraryBtn(btn) {
    btn.addEventListener('click', function () {
      const row = btn.closest('.itinerary-item');
      if (row) {
        row.remove();
        syncItineraryTotals();
      }
    });
  }

  // Bind existing Remove buttons on initial load
  document.querySelectorAll('.btn-remove-itinerary').forEach(bindRemoveItineraryBtn);

  // FEATURE 1: Add New Item to Smart Itinerary Builder using DOM Manipulation
  if (addItineraryForm) {
    addItineraryForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Format of option value: "Title|Type|Meta|Price"
      const parts = savedListingSelect.value.split('|');
      const title = parts[0];
      const type = parts[1];
      const meta = parts[2];
      const price = parseFloat(parts[3]) || 0;
      const day = Math.max(1, parseInt(dayInput.value, 10) || 1);

      const badgeClass = type === 'Homestay' ? 'badge-info' : 'badge-neutral';

      // Create new DOM element for the timeline item
      const newItem = document.createElement('div');
      newItem.className = 'itinerary-item';
      newItem.setAttribute('data-day', String(day));
      newItem.setAttribute('data-type', type);
      newItem.setAttribute('data-price', String(price));

      newItem.innerHTML =
        '<span class="day-pill">Day ' +
        day +
        '</span>' +
        '<div>' +
        '  <div class="itinerary-info-title">' +
        title +
        '</div>' +
        '  <div class="itinerary-info-meta">' +
        '    <span class="badge ' +
        badgeClass +
        '">' +
        type +
        '</span>' +
        '    <span>' +
        meta +
        '</span>' +
        '  </div>' +
        '</div>' +
        '<div class="itinerary-price">৳' +
        formatCurrency(price) +
        '</div>' +
        '<button type="button" class="btn btn-remove btn-remove-itinerary">Remove</button>';

      // Insert in chronological order by Day #
      const existingItems = Array.from(timeline.querySelectorAll('.itinerary-item'));
      const insertBeforeTarget = existingItems.find(function (el) {
        return parseInt(el.getAttribute('data-day'), 10) > day;
      });

      if (insertBeforeTarget) {
        timeline.insertBefore(newItem, insertBeforeTarget);
      } else {
        timeline.appendChild(newItem);
      }

      bindRemoveItineraryBtn(newItem.querySelector('.btn-remove-itinerary'));
      syncItineraryTotals();
    });
  }

  // Listen to manual edits on the Split Cost Calculator inputs
  homestaysTotalInput.addEventListener('input', updateSplitCostCalculator);
  toursTotalInput.addEventListener('input', updateSplitCostCalculator);
  participantsInput.addEventListener('input', updateSplitCostCalculator);

  /* --------------------------------------------------------------------------
     FEATURE 2: AJAX BOOKING NEGOTIATION
     Stores conversation threads per host/guide and sends messages/offers
     asynchronously without reloading the page.
     -------------------------------------------------------------------------- */
  const conversationsData = {
    meherunnissa: {
      initials: 'MP',
      title: 'Meherunnissa Ponni · Host',
      shortName: 'Meherunnissa',
      meta: 'Srimangal Green Homestay · 2 nights · 4 guests',
      listedPrice: 240,
      defaultOffer: 220,
      defaultDraft: 'Would you accept ৳220 for the two-night stay?',
      messages: [
        {
          sender: 'outgoing',
          text: "Hi Meherunnissa! We're planning a two-night stay in Srimangal for 4 guests. Is there any flexibility on the price?",
          time: 'You · 10:20 AM'
        },
        {
          sender: 'incoming',
          text: "Hi Akimul! Yes, the listed total is ৳240 for your group. I'm happy to consider an offer for the two nights.",
          time: 'Meherunnissa · 10:24 AM'
        }
      ]
    },
    jemam: {
      initials: 'JI',
      title: 'Jemam Bin Islam · Guide',
      shortName: 'Jemam',
      meta: 'Lawachara Rainforest Trail · Half day · 4 guests',
      listedPrice: 120,
      defaultOffer: 105,
      defaultDraft: 'Could we book the morning trail walk for ৳105 for our group of 4?',
      messages: [
        {
          sender: 'outgoing',
          text: 'Hi Jemam! Does the Lawachara Rainforest Trail include pickup from central Srimangal?',
          time: 'You · 09:40 AM'
        },
        {
          sender: 'incoming',
          text: 'Hello Akimul! Yes, hotel pickup is included. We can start at 8 AM.',
          time: 'Jemam · 09:45 AM'
        }
      ]
    },
    farzana: {
      initials: 'FR',
      title: 'Farzana Rahman · Host',
      shortName: 'Farzana',
      meta: 'Surma Riverside Guesthouse · 1 night · 4 guests',
      listedPrice: 160,
      defaultOffer: 145,
      defaultDraft: 'Hi Farzana, would ৳145 work for our 1-night stay?',
      messages: [
        {
          sender: 'incoming',
          text: 'Welcome! Your group is welcome at Surma Riverside Guesthouse in Sylhet. Let me know if you have any questions.',
          time: 'Farzana · Yesterday'
        }
      ]
    }
  };

  let activeConvKey = 'meherunnissa';
  const convItems = document.querySelectorAll('.conv-item');
  const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
  const chatHeaderTitle = document.getElementById('chatHeaderTitle');
  const chatHeaderMeta = document.getElementById('chatHeaderMeta');
  const chatHeaderPrice = document.getElementById('chatHeaderPrice');
  const chatMessagesContainer = document.getElementById('chatMessagesContainer');
  const msgInput = document.getElementById('negotiationMessageInput');
  const offerInput = document.getElementById('negotiationOfferInput');
  const negotiationCaption = document.getElementById('negotiationCaption');
  const ajaxForm = document.getElementById('ajaxNegotiationForm');
  const sendAjaxBtn = document.getElementById('sendAjaxBtn');

  /**
   * Renders the selected conversation thread in the chat window.
   */
  function renderConversation(convKey) {
    const conv = conversationsData[convKey];
    if (!conv) return;

    chatHeaderAvatar.textContent = conv.initials;
    chatHeaderTitle.textContent = conv.title;
    chatHeaderMeta.textContent = conv.meta;
    chatHeaderPrice.textContent = '৳' + formatCurrency(conv.listedPrice);
    negotiationCaption.textContent =
      'Proposed offer only. Your itinerary remains at ৳' +
      conv.listedPrice +
      ' until a new price is agreed.';

    chatMessagesContainer.innerHTML = '<div class="chat-day-divider">Today</div>';
    conv.messages.forEach(function (msg) {
      const wrap = document.createElement('div');
      wrap.className = 'chat-bubble-wrap ' + msg.sender;
      wrap.innerHTML =
        '<div class="chat-bubble">' +
        msg.text +
        '</div>' +
        '<div class="chat-timestamp">' +
        msg.time +
        '</div>';
      chatMessagesContainer.appendChild(wrap);
    });

    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }

  // Switch active conversation when clicking a left-hand conversation card
  convItems.forEach(function (item) {
    item.addEventListener('click', function () {
      const key = item.getAttribute('data-conv-id');
      if (!key || !conversationsData[key]) return;

      activeConvKey = key;
      convItems.forEach(function (el) {
        el.classList.toggle('active', el === item);
      });

      const conv = conversationsData[key];
      msgInput.value = conv.defaultDraft;
      offerInput.value = conv.defaultOffer;
      renderConversation(key);
    });
  });

  // Handle "Send via AJAX" form submission without reloading the page
  if (ajaxForm) {
    ajaxForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const text = msgInput.value.trim();
      const offer = parseFloat(offerInput.value);
      const conv = conversationsData[activeConvKey];

      if (!text || isNaN(offer) || offer <= 0) return;

      // Disable button briefly to indicate asynchronous AJAX transmission
      sendAjaxBtn.disabled = true;
      sendAjaxBtn.textContent = 'Sending...';

      /*
       * Future PHP Integration Example:
       * fetch('api/send_negotiation.php', {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify({ recipient: activeConvKey, message: text, proposed_price: offer })
       * }).then(res => res.json()).then(data => { ... });
       */

      setTimeout(function () {
        const nowStr = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Append Traveler's outgoing offer message
        conv.messages.push({
          sender: 'outgoing',
          text:
            text +
            ' <strong>(Proposed Offer: ৳' +
            formatCurrency(offer) +
            ')</strong>',
          time: 'You · ' + nowStr
        });

        // Update conversation preview in left list
        const previewEl = document.querySelector(
          '[data-conv-preview="' + activeConvKey + '"]'
        );
        if (previewEl) {
          previewEl.textContent = 'You offered ৳' + offer + ': ' + text;
        }

        renderConversation(activeConvKey);
        msgInput.value = '';
        sendAjaxBtn.disabled = false;
        sendAjaxBtn.textContent = 'Send via AJAX';

        // Simulate realistic asynchronous Host/Guide reply
        setTimeout(function () {
          conv.messages.push({
            sender: 'incoming',
            text:
              'Thanks Akimul! I have received your offer of ৳' +
              formatCurrency(offer) +
              ' and will confirm your booking request shortly.',
            time: conv.shortName + ' · Just now'
          });
          if (previewEl) {
            previewEl.textContent = 'Received your ৳' + offer + ' offer!';
          }
          renderConversation(activeConvKey);
        }, 700);
      }, 300);
    });
  }
}

/* ============================================================================
   PAGE 6: HOMESTAY HOST DASHBOARD (host-dashboard.html)
   Implements:
     Feature 4: Dynamic Seasonal Pricing
     Feature 5: Flexible Booking Management (Instant booking toggle + Accept/Reject)
     Feature 6: Earnings & Booking Analytics (Live KPI & table updates)
   ============================================================================ */
function initHostDashboard() {
  // State matching the initial Figma dashboard numbers
  let confirmedBookings = 18;
  let grossEarnings = 4320.0;
  const commissionRate = 0.1; // 10% platform commission

  const kpiConfirmedCount = document.getElementById('kpiConfirmedCount');
  const kpiGrossEarnings = document.getElementById('kpiGrossEarnings');
  const kpiNetIncome = document.getElementById('kpiNetIncome');
  const kpiCommissionSubtext = document.getElementById('kpiCommissionSubtext');

  const octBookingsCell = document.getElementById('octBookingsCell');
  const octGrossCell = document.getElementById('octGrossCell');
  const octCommCell = document.getElementById('octCommCell');
  const octNetCell = document.getElementById('octNetCell');

  /**
   * FEATURE 6: Updates the KPI cards and the October 2026 row in the Monthly
   * Income Summary table whenever a booking request is accepted.
   */
  function renderHostAnalytics() {
    const commissionAmount = grossEarnings * commissionRate;
    const netIncome = grossEarnings - commissionAmount;

    kpiConfirmedCount.textContent = String(confirmedBookings);
    kpiGrossEarnings.textContent = formatCurrency(grossEarnings);
    kpiNetIncome.textContent = formatCurrency(netIncome);
    kpiCommissionSubtext.textContent =
      '৳' + formatCurrency(commissionAmount) + ' estimated commission';

    octBookingsCell.textContent = String(confirmedBookings);
    octGrossCell.textContent = formatCurrency(grossEarnings);
    octCommCell.textContent = formatCurrency(commissionAmount);
    octNetCell.textContent = formatCurrency(netIncome);
  }

  /* --------------------------------------------------------------------------
     FEATURE 4: DYNAMIC SEASONAL PRICING
     Adds new seasonal pricing rules to the Active Pricing Rules list.
     -------------------------------------------------------------------------- */
  const seasonalForm = document.getElementById('seasonalPricingForm');
  const rulesList = document.getElementById('seasonalRulesList');
  const ruleCountSpan = document.getElementById('seasonalRuleCount');

  if (seasonalForm) {
    seasonalForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const seasonType = document.getElementById('seasonTypeSelect').value;
      const price = parseFloat(document.getElementById('seasonalPriceInput').value);
      const startDate = document.getElementById('seasonStartDate').value.trim();
      const endDate = document.getElementById('seasonEndDate').value.trim();

      if (isNaN(price) || price <= 0 || !startDate || !endDate) return;

      const scheduleLabel =
        seasonType === 'Weekend' ? 'Sat & Sun' : 'Every night';

      const ruleItem = document.createElement('div');
      ruleItem.className = 'seasonal-rule-item';
      ruleItem.innerHTML =
        '<div>' +
        '  <div class="cell-primary" style="font-size: 0.85rem;">' +
        seasonType +
        '</div>' +
        '  <div class="cell-secondary">' +
        startDate +
        ' &ndash; ' +
        endDate +
        ' &middot; ' +
        scheduleLabel +
        '</div>' +
        '</div>' +
        '<div class="text-right">' +
        '  <div class="cell-primary" style="font-size: 0.9rem;">৳' +
        Math.round(price) +
        '</div>' +
        '  <div class="cell-secondary">/ night</div>' +
        '</div>';

      rulesList.appendChild(ruleItem);
      const totalRules = rulesList.querySelectorAll('.seasonal-rule-item').length;
      ruleCountSpan.textContent = totalRules + (totalRules === 1 ? ' rule' : ' rules');
    });
  }

  /* --------------------------------------------------------------------------
     FEATURE 5: FLEXIBLE BOOKING MANAGEMENT
     Handles Instant Booking toggle switch and Accept/Reject actions.
     -------------------------------------------------------------------------- */
  const instantToggle = document.getElementById('instantBookingToggle');
  const instantStateText = document.getElementById('instantBookingStateText');
  const instantFootnote = document.getElementById('instantBookingFootnote');
  const pendingBadge = document.getElementById('hostPendingBadge');
  const requestsBody = document.getElementById('hostBookingRequestsBody');

  if (instantToggle) {
    instantToggle.addEventListener('click', function () {
      const isCurrentlyActive = instantToggle.classList.toggle('active');
      instantToggle.setAttribute('aria-checked', String(isCurrentlyActive));
      instantStateText.textContent = isCurrentlyActive ? 'On' : 'Off';

      if (isCurrentlyActive) {
        instantFootnote.textContent =
          'Instant booking is ON. Future guests meeting your seasonal pricing rules will be confirmed automatically without manual approval.';
      } else {
        instantFootnote.textContent =
          'Instant booking is off. New requests require your approval. Accepting confirms the booking at the negotiated stay total; rejecting declines the request.';
      }
    });
  }

  function updateHostPendingCount() {
    if (!requestsBody || !pendingBadge) return;
    const pendingRows = requestsBody.querySelectorAll('.badge-pending').length;
    pendingBadge.textContent =
      pendingRows + (pendingRows === 1 ? ' pending request' : ' pending requests');
  }

  // Accept Booking Request -> Confirms row & adds revenue to Host Analytics
  document.querySelectorAll('.btn-host-accept').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const row = btn.closest('tr');
      if (!row) return;

      const stayPrice = parseFloat(row.getAttribute('data-request-price')) || 0;
      const statusCell = row.querySelector('.request-status-cell');
      const actionsCell = row.querySelector('.request-actions-cell');

      statusCell.innerHTML = '<span class="badge badge-approved">Confirmed</span>';
      actionsCell.innerHTML =
        '<span style="font-size: 0.75rem; font-weight: 600; color: var(--success-text);">Accepted ✓</span>';

      confirmedBookings += 1;
      grossEarnings += stayPrice;
      renderHostAnalytics();
      updateHostPendingCount();
    });
  });

  // Reject Booking Request -> Marks row as Rejected
  document.querySelectorAll('.btn-host-reject').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const row = btn.closest('tr');
      if (!row) return;

      const statusCell = row.querySelector('.request-status-cell');
      const actionsCell = row.querySelector('.request-actions-cell');

      statusCell.innerHTML = '<span class="badge badge-rejected">Rejected</span>';
      actionsCell.innerHTML =
        '<span style="font-size: 0.75rem; color: var(--text-muted);">Declined</span>';

      updateHostPendingCount();
    });
  });
}

/* ============================================================================
   PAGE 7: LOCAL TOUR GUIDE DASHBOARD (guide-dashboard.html)
   Implements:
     Feature 7: Custom Tour Bidding
     Feature 8: Tour Progress Tracker
     Feature 9: Guide Portfolio & Verification
   ============================================================================ */
function initGuideDashboard() {
  /* --------------------------------------------------------------------------
     FEATURE 7: CUSTOM TOUR BIDDING
     Selecting a traveler request row populates the personalized offer form.
     -------------------------------------------------------------------------- */
  const requestRows = document.querySelectorAll('#tourBidRequestsBody tr');
  const bidTargetSummary = document.getElementById('bidTargetSummary');
  const bidProposedPrice = document.getElementById('bidProposedPrice');
  const bidGroupHelperText = document.getElementById('bidGroupHelperText');
  const bidProposedItinerary = document.getElementById('bidProposedItinerary');
  const submitTourBidForm = document.getElementById('submitTourBidForm');

  requestRows.forEach(function (row) {
    row.addEventListener('click', function () {
      requestRows.forEach(function (r) {
        r.classList.remove('row-selected');
        const nameSpan = r.querySelector('.traveler-name-span');
        if (nameSpan) nameSpan.style.color = '';
        const radio = r.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
      });

      row.classList.add('row-selected');
      const activeRadio = row.querySelector('input[type="radio"]');
      if (activeRadio) activeRadio.checked = true;
      const activeNameSpan = row.querySelector('.traveler-name-span');
      if (activeNameSpan) activeNameSpan.style.color = 'var(--primary)';

      const traveler = row.getAttribute('data-traveler');
      const dest = row.getAttribute('data-destination');
      const date = row.getAttribute('data-date');
      const group = row.getAttribute('data-group');
      const price = row.getAttribute('data-price');
      const itinerary = row.getAttribute('data-itinerary');

      bidTargetSummary.textContent =
        'For ' + traveler + ' · ' + dest + ' · ' + date + ' · ' + group;
      bidProposedPrice.value = price;
      bidGroupHelperText.textContent = 'Total for all ' + group + ' · BDT (৳)';
      bidProposedItinerary.value = itinerary;
    });
  });

  if (submitTourBidForm) {
    submitTourBidForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const selectedRow = document.querySelector('#tourBidRequestsBody tr.row-selected');
      const priceVal = parseFloat(bidProposedPrice.value);
      const itineraryVal = bidProposedItinerary.value.trim();

      if (!selectedRow || isNaN(priceVal) || priceVal <= 0 || !itineraryVal) return;

      const traveler = selectedRow.getAttribute('data-traveler');
      bidTargetSummary.innerHTML =
        '<strong style="color: var(--success-text);">Bid of ৳' +
        formatCurrency(priceVal) +
        ' sent to ' +
        traveler +
        ' ✓</strong>';
    });
  }

  /* --------------------------------------------------------------------------
     FEATURE 8: TOUR PROGRESS TRACKER
     Updates assigned tour status (Scheduled, In Progress, Completed).
     -------------------------------------------------------------------------- */
  const tourProgressFeedback = document.getElementById('tourProgressFeedback');
  document.querySelectorAll('.btn-save-tour-status').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const row = btn.closest('tr');
      if (!row) return;

      const tourTitle = row.cells[0].textContent.trim();
      const travelerName = row.cells[1].textContent.trim();
      const statusSelect = row.querySelector('.tour-status-select');
      const newStatus = statusSelect ? statusSelect.value : 'Updated';

      btn.textContent = 'Saved ✓';
      setTimeout(function () {
        btn.textContent = 'Update';
      }, 1400);

      if (tourProgressFeedback) {
        tourProgressFeedback.innerHTML =
          '<strong style="color: var(--success-text);">Updated:</strong> "' +
          tourTitle +
          '" for ' +
          travelerName +
          ' is now marked as <strong>' +
          newStatus +
          '</strong>.';
      }
    });
  });

  /* --------------------------------------------------------------------------
     FEATURE 9: GUIDE PORTFOLIO & VERIFICATION
     Updates file input labels and handles submission to Admin.
     -------------------------------------------------------------------------- */
  const tourPhotosInput = document.getElementById('tourPhotosInput');
  const tourPhotosFileName = document.getElementById('tourPhotosFileName');
  const tourismCertInput = document.getElementById('tourismCertInput');
  const tourismCertFileName = document.getElementById('tourismCertFileName');
  const portfolioForm = document.getElementById('guidePortfolioForm');
  const portfolioSubmitHint = document.getElementById('portfolioSubmitHint');

  if (tourPhotosInput) {
    tourPhotosInput.addEventListener('change', function () {
      const count = tourPhotosInput.files.length;
      if (count > 0) {
        tourPhotosFileName.textContent =
          count === 1 ? tourPhotosInput.files[0].name : count + ' files selected';
      }
    });
  }

  if (tourismCertInput) {
    tourismCertInput.addEventListener('change', function () {
      if (tourismCertInput.files[0]) {
        tourismCertFileName.textContent = tourismCertInput.files[0].name;
      }
    });
  }

  if (portfolioForm) {
    portfolioForm.addEventListener('submit', function (e) {
      e.preventDefault();
      portfolioSubmitHint.innerHTML =
        '<strong style="color: var(--success-text);">Portfolio & certificate submitted to Admin for verification review ✓</strong>';
    });
  }
}

/* ============================================================================
   PAGE 8: ADMINISTRATOR PANEL (admin-dashboard.html)
   Implements:
     Feature 10: User & Listing Verification (Document modal + Approve/Reject)
     Feature 11: Booking Dispute Management (Dispute viewer + Resolution)
     Feature 12: Platform Commission Management (Dynamic commission calculation)
   ============================================================================ */
function initAdminDashboard() {
  /* --------------------------------------------------------------------------
     FEATURE 12: PLATFORM COMMISSION MANAGEMENT
     Dynamically calculates Platform Fee and Net Earnings on a ৳200 booking.
     -------------------------------------------------------------------------- */
  const commissionForm = document.getElementById('commissionForm');
  const commissionInput = document.getElementById('commissionRateInput');
  const previewText = document.getElementById('commissionPreviewText');
  const currentRateCaption = document.getElementById('currentRateCaption');

  function updateCommissionPreview() {
    const rate = Math.max(0, Math.min(100, parseFloat(commissionInput.value) || 0));
    const sampleBooking = 200;
    const fee = (sampleBooking * rate) / 100;
    const net = sampleBooking - fee;

    // Format cleanly (integer if whole number, otherwise 2 decimals)
    const feeStr = Number.isInteger(fee) ? String(fee) : fee.toFixed(2);
    const netStr = Number.isInteger(net) ? String(net) : net.toFixed(2);

    previewText.innerHTML =
      'Example ৳200 Booking &rarr; Platform Fee: ৳' +
      feeStr +
      ' | Host/Guide Net Earnings: ৳' +
      netStr;
  }

  if (commissionInput) {
    commissionInput.addEventListener('input', updateCommissionPreview);
  }

  if (commissionForm) {
    commissionForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const rate = Math.max(0, Math.min(100, parseFloat(commissionInput.value) || 0));
      updateCommissionPreview();
      localStorage.setItem('localnest_commission_rate', String(rate));
      currentRateCaption.innerHTML =
        '<strong style="color: var(--success-text);">Rate updated to ' +
        rate +
        '% ✓</strong> &middot; Applied to new bookings after the rate is updated.';
    });
  }

  /* --------------------------------------------------------------------------
     FEATURE 10: USER & LISTING VERIFICATION
     Document preview modal + Approve & Publish / Reject row actions.
     -------------------------------------------------------------------------- */
  const pendingVerificationsCount = document.getElementById('pendingVerificationsCount');
  const verificationsBody = document.getElementById('verificationsTableBody');
  const docModal = document.getElementById('docPreviewModal');
  const docModalTitle = document.getElementById('docModalTitle');
  const docModalMeta = document.getElementById('docModalMeta');
  const closeDocModal = document.getElementById('closeDocModal');
  const docModalCloseBtn = document.getElementById('docModalCloseBtn');

  function updateVerificationCounter() {
    if (!verificationsBody || !pendingVerificationsCount) return;
    const remaining = verificationsBody.querySelectorAll('.badge-pending').length;
    pendingVerificationsCount.textContent =
      remaining + (remaining === 1 ? ' pending submission' : ' pending submissions');
  }

  document.querySelectorAll('.btn-verify-approve').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const row = btn.closest('tr');
      if (!row) return;
      const statusCell = row.querySelector('.verification-status-cell');
      statusCell.innerHTML = '<span class="badge badge-approved">Approved</span>';
      btn.parentElement.innerHTML =
        '<span style="font-size: 0.75rem; font-weight: 600; color: var(--success-text);">Published ✓</span>';
      updateVerificationCounter();
    });
  });

  document.querySelectorAll('.btn-verify-reject').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const row = btn.closest('tr');
      if (!row) return;
      const statusCell = row.querySelector('.verification-status-cell');
      statusCell.innerHTML = '<span class="badge badge-rejected">Rejected</span>';
      btn.parentElement.innerHTML =
        '<span style="font-size: 0.75rem; color: var(--danger-text);">Rejected</span>';
      updateVerificationCounter();
    });
  });

  // Document/Photo Preview Links
  document.querySelectorAll('.preview-doc-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      if (!docModal) return;
      docModalTitle.textContent = link.getAttribute('data-doc-title');
      docModalMeta.textContent = link.getAttribute('data-doc-meta');
      docModal.classList.add('open');
    });
  });

  function hideDocModal() {
    if (docModal) docModal.classList.remove('open');
  }
  if (closeDocModal) closeDocModal.addEventListener('click', hideDocModal);
  if (docModalCloseBtn) docModalCloseBtn.addEventListener('click', hideDocModal);

  /* --------------------------------------------------------------------------
     FEATURE 11: BOOKING DISPUTE MANAGEMENT
     Clicking any dispute row loads its full evidence & conversation history.
     -------------------------------------------------------------------------- */
  const disputesData = {
    'DSP-1042': {
      id: 'DSP-1042',
      status: 'Under review',
      statusClass: 'badge-info',
      bookingTitle: 'BK-2081 · Srimangal Green Homestay',
      bookingMeta: 'Oct 20–22, 2026 · Booking total: ৳200.00',
      parties: 'Tanvir Ahmed (Traveler) · Meherunnissa Ponni (Host)',
      complaintTitle: 'Airport pickup not provided',
      complaintDesc:
        'Traveler requests ৳25 for a taxi. Host is reviewing the updated arrival time and driver records.',
      messages: [
        {
          author: 'Tanvir Ahmed · Traveler',
          time: 'Oct 22 · 09:15',
          text: 'Our ৳200 booking included airport pickup, but no driver arrived. We paid ৳25 for a taxi. Could you reimburse that cost?'
        },
        {
          author: 'Meherunnissa Ponni · Host',
          time: 'Oct 22 · 10:02',
          text: 'I arranged a driver for 14:00. The flight arrived later than the time shared. Please send your arrival time and taxi receipt so we can review.'
        },
        {
          author: 'Tanvir Ahmed · Traveler',
          time: 'Oct 22 · 10:18',
          text: 'Attached flight delay notice and ৳25 airport taxi receipt for review.'
        },
        {
          author: 'Meherunnissa Ponni · Host',
          time: 'Oct 22 · 10:40',
          text: 'Thank you, I have asked Admin support to help mediate the airport transfer fee.'
        }
      ]
    },
    'DSP-1041': {
      id: 'DSP-1041',
      status: 'Under review',
      statusClass: 'badge-info',
      bookingTitle: 'BK-2074 · Ratargul & Bisnakandi Boat Tour',
      bookingMeta: 'Oct 18, 2026 · Booking total: ৳150.00',
      parties: 'Nusrat Jahan (Traveler) · Jemam Bin Islam (Guide)',
      complaintTitle: 'Tour itinerary changed',
      complaintDesc:
        'Afternoon Bisnakandi boat ride was skipped due to heavy rain; traveler requests partial refund for unused boat tickets.',
      messages: [
        {
          author: 'Nusrat Jahan · Traveler',
          time: 'Oct 18 · 16:30',
          text: 'Since we could not visit Bisnakandi due to the storm, can we get a ৳30 refund for the boat fees?'
        },
        {
          author: 'Jemam Bin Islam · Guide',
          time: 'Oct 18 · 17:05',
          text: 'Yes, the boat was not hired at the ghat because of the weather alert. I support refunding the ৳30 boat portion.'
        },
        {
          author: 'Nusrat Jahan · Traveler',
          time: 'Oct 18 · 17:15',
          text: 'Thank you Jemam! Submitting to Admin to process the adjustment.'
        }
      ]
    },
    'DSP-1039': {
      id: 'DSP-1039',
      status: 'Under review',
      statusClass: 'badge-info',
      bookingTitle: 'BK-2068 · Sundarbans Mangrove Day Cruise',
      bookingMeta: 'Oct 14, 2026 · Booking total: ৳120.00',
      parties: 'Tasnim Zara (Traveler) · Mahmudul Hasan (Guide)',
      complaintTitle: 'Cancellation fee questioned',
      complaintDesc:
        'Traveler cancelled 36 hours prior to departure and is requesting a full waiver of the 20% cancellation fee.',
      messages: [
        {
          author: 'Tasnim Zara · Traveler',
          time: 'Oct 12 · 20:10',
          text: 'We had to reschedule our trip from Khulna. Since it is more than 24 hours before the tour, is the cancellation fee waived?'
        },
        {
          author: 'Mahmudul Hasan · Guide',
          time: 'Oct 12 · 21:00',
          text: 'Hi Tasnim, private launch reservation was already paid for your date, but I am happy to let the Admin review the platform policy.'
        }
      ]
    }
  };

  let activeDisputeId = 'DSP-1042';
  const disputeRows = document.querySelectorAll('#disputesTableBody tr');
  const detailDisputeId = document.getElementById('detailDisputeId');
  const detailStatusBadge = document.getElementById('detailDisputeStatusBadge');
  const detailBookingTitle = document.getElementById('detailBookingTitle');
  const detailBookingMeta = document.getElementById('detailBookingMeta');
  const detailParties = document.getElementById('detailParties');
  const detailComplaintTitle = document.getElementById('detailComplaintTitle');
  const detailComplaintDesc = document.getElementById('detailComplaintDesc');
  const detailMsgCount = document.getElementById('detailMsgCount');
  const detailMessagesBox = document.getElementById('detailMessagesBox');
  const resolveTravelerBtn = document.getElementById('resolveTravelerBtn');
  const resolveHostBtn = document.getElementById('resolveHostBtn');
  const disputeResolutionNote = document.getElementById('disputeResolutionNote');
  const activeDisputesCounter = document.getElementById('activeDisputesCounter');

  function renderDisputeDetail(disputeId) {
    const d = disputesData[disputeId];
    if (!d) return;

    detailDisputeId.textContent = d.id;
    detailStatusBadge.textContent = d.status;
    detailStatusBadge.className = 'badge ' + d.statusClass;
    detailBookingTitle.textContent = d.bookingTitle;
    detailBookingMeta.textContent = d.bookingMeta;
    detailParties.textContent = d.parties;
    detailComplaintTitle.textContent = d.complaintTitle;
    detailComplaintDesc.textContent = d.complaintDesc;
    detailMsgCount.textContent = d.messages.length + ' messages';

    detailMessagesBox.innerHTML = '';
    d.messages.forEach(function (m) {
      const item = document.createElement('div');
      item.className = 'saved-msg-item';
      item.innerHTML =
        '<div style="font-weight: 700;">' +
        m.author +
        '</div>' +
        '<div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 4px;">' +
        m.time +
        '</div>' +
        '<div>' +
        m.text +
        '</div>';
      detailMessagesBox.appendChild(item);
    });

    const isResolved = d.status !== 'Under review';
    resolveTravelerBtn.disabled = isResolved;
    resolveHostBtn.disabled = isResolved;
  }

  disputeRows.forEach(function (row) {
    row.addEventListener('click', function () {
      const id = row.getAttribute('data-dispute-id');
      if (!id || !disputesData[id]) return;

      activeDisputeId = id;
      disputeRows.forEach(function (r) {
        const isCurrent = r === row;
        r.classList.toggle('row-selected', isCurrent);
        r.style.borderLeft = isCurrent ? '3px solid var(--primary)' : 'none';
        const firstPrimary = r.querySelector('.cell-primary');
        const tag = r.querySelector('.dispute-selected-tag');
        if (firstPrimary) {
          firstPrimary.style.color = isCurrent ? 'var(--primary)' : '';
        }
        if (tag) {
          tag.textContent = isCurrent ? 'Selected' : '';
          tag.style.color = isCurrent ? 'var(--primary)' : '';
        }
      });

      renderDisputeDetail(id);
    });
  });

  function resolveCurrentDispute(resolutionLabel) {
    const d = disputesData[activeDisputeId];
    if (!d) return;

    d.status = resolutionLabel;
    d.statusClass = 'badge-approved';
    renderDisputeDetail(activeDisputeId);

    const remainingActive = Object.values(disputesData).filter(function (item) {
      return item.status === 'Under review';
    }).length;

    activeDisputesCounter.textContent =
      remainingActive + (remainingActive === 1 ? ' active dispute' : ' active disputes');
    disputeResolutionNote.innerHTML =
      '<strong style="color: var(--success-text);">Decision recorded for ' +
      activeDisputeId +
      ': ' +
      resolutionLabel +
      ' ✓</strong>';
  }

  if (resolveTravelerBtn) {
    resolveTravelerBtn.addEventListener('click', function () {
      resolveCurrentDispute('Resolved · Traveler Refunded');
    });
  }

  if (resolveHostBtn) {
    resolveHostBtn.addEventListener('click', function () {
      resolveCurrentDispute('Resolved · Host/Guide Payout');
    });
  }
}
