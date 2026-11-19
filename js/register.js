/**
 * ============================================================================
 * REGISTRATION PAGE JAVASCRIPT (js/register.js)
 * Used by: register.html
 * Description:
 * Simple client-side form validation for registration (checks empty fields,
 * email format, minimum 8-character password, and matching confirmation).
 * ============================================================================
 */

const registerForm = document.getElementById('registerForm');
const statusBanner = document.getElementById('registerStatusBanner');

if (registerForm) {
  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const role = document.getElementById('regRole').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    statusBanner.style.display = 'block';

    // 1. Check required fields
    if (fullName === '' || email === '' || password === '' || confirmPassword === '') {
      statusBanner.textContent = 'All fields are required to create an account.';
      statusBanner.className = 'status-banner status-error';
      return;
    }

    // 2. Check basic email format
    if (!email.includes('@') || !email.includes('.')) {
      statusBanner.textContent = 'Please enter a valid email address.';
      statusBanner.className = 'status-banner status-error';
      return;
    }

    // 3. Check password length
    if (password.length < 8) {
      statusBanner.textContent = 'Password must be at least 8 characters long.';
      statusBanner.className = 'status-banner status-error';
      return;
    }

    // 4. Check if passwords match
    if (password !== confirmPassword) {
      statusBanner.textContent = 'Passwords do not match. Please try again.';
      statusBanner.className = 'status-banner status-error';
      return;
    }

    // 5. Validation passed (PHP will insert into MySQL USER table later)
    statusBanner.textContent = 'Registration valid! Redirecting to your dashboard...';
    statusBanner.className = 'status-banner status-success';

    if (role === 'Host') {
      window.location.href = 'host-dashboard.html';
    } else if (role === 'Guide') {
      window.location.href = 'guide-dashboard.html';
    } else {
      window.location.href = 'traveler-dashboard.html';
    }
  });
}
