/**
 * ============================================================================
 * PROFILE SETTINGS JAVASCRIPT (js/profile-settings.js)
 * Used by: profile-settings.html
 * Description:
 * Simple client-side form validation for Manage Profile Information and
 * Change / Reset Password forms.
 * ============================================================================
 */

const profileForm = document.getElementById('profileInfoForm');
const profileBanner = document.getElementById('profileStatusBanner');
const photoInput = document.getElementById('profilePhotoInput');
const photoFileName = document.getElementById('profilePhotoFileName');

// Show selected image file name when the user picks a file
if (photoInput) {
  photoInput.addEventListener('change', function () {
    if (photoInput.files.length > 0) {
      photoFileName.textContent = photoInput.files[0].name;
    }
  });
}

// 1. Validate Manage Profile Information form
if (profileForm) {
  profileForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const fullName = document.getElementById('profileFullName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();

    profileBanner.style.display = 'block';

    if (fullName === '' || email === '' || phone === '') {
      profileBanner.textContent = 'Full Name, Email, and Phone Number are required.';
      profileBanner.className = 'status-banner status-error';
      return;
    }

    // Update name in top header bar
    document.getElementById('topbarUserName').textContent = fullName;

    profileBanner.textContent = 'Profile changes validated (ready for PHP database update).';
    profileBanner.className = 'status-banner status-success';
  });
}

// 2. Validate Change / Reset Password form
const passwordForm = document.getElementById('changePasswordForm');
const passwordBanner = document.getElementById('passwordStatusBanner');

if (passwordForm) {
  passwordForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    passwordBanner.style.display = 'block';

    if (currentPassword === '' || newPassword === '' || confirmNewPassword === '') {
      passwordBanner.textContent = 'Please fill in all three password fields.';
      passwordBanner.className = 'status-banner status-error';
      return;
    }

    if (newPassword.length < 8) {
      passwordBanner.textContent = 'New password must be at least 8 characters.';
      passwordBanner.className = 'status-banner status-error';
      return;
    }

    if (newPassword !== confirmNewPassword) {
      passwordBanner.textContent = 'New password and confirmation do not match.';
      passwordBanner.className = 'status-banner status-error';
      return;
    }

    passwordBanner.textContent = 'Password validated! (PHP will hash and save to database).';
    passwordBanner.className = 'status-banner status-success';
    passwordForm.reset();
  });
}
