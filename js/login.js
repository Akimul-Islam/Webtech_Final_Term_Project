
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('loginEmail');
const passwordInput = document.getElementById('loginPassword');
const statusBanner = document.getElementById('loginStatusBanner');

if (loginForm) {
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();


    if (email === '' || password === '') {
      statusBanner.textContent = 'Please enter both your email and password.';
      statusBanner.className = 'status-banner status-error';
      return;
    }


    if (!email.includes('@') || !email.includes('.')) {
      statusBanner.textContent = 'Please enter a valid email address.';
      statusBanner.className = 'status-banner status-error';
      return;
    }


    statusBanner.textContent = 'Validation passed! Redirecting to dashboard...';
    statusBanner.className = 'status-banner status-success';

    window.location.href = 'traveler-dashboard.html';
  });
}
