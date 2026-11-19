/**
 * ============================================================================
 * LOGIN PAGE JAVASCRIPT (js/login.js)
 * Used by: login.html
 * Description:
 * Simple client-side form validation for the Login form before PHP integration.
 * ============================================================================
 */

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');
const statusBanner = document.getElementById('loginStatusBanner');

if (loginForm) {
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // 1. Check if fields are empty
    if (email === '' || password === '') {
      statusBanner.textContent = 'Please enter both your email and password.';
      statusBanner.className = 'status-banner status-error';
      return;
    }

    // 2. Check basic email format
    if (!email.includes('@') || !email.includes('.')) {
      statusBanner.textContent = 'Please enter a valid email address.';
      statusBanner.className = 'status-banner status-error';
      return;
    }

    // 3. Validation passed (PHP session authentication will handle the rest later)
    statusBanner.textContent = 'Validation passed! Redirecting to dashboard...';
    statusBanner.className = 'status-banner status-success';

    window.location.href = 'traveler-dashboard.html';
  });
}
