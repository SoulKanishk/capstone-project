/**
 * Main Application Module
 */

import { validateField, validateForm } from './validator.js';
import { loadSettings, saveSettings, resetSettings } from './storage.js';
import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings-form');
  const liveRegion = document.getElementById('form-live-region');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const resetBtn = document.getElementById('btn-reset');

  const fields = ['fullName', 'email', 'username'];

  // 1. Populate form from storage
  function initForm() {
    const settings = loadSettings();
    document.getElementById('fullName').value = settings.fullName || '';
    document.getElementById('email').value = settings.email || '';
    document.getElementById('username').value = settings.username || '';
    document.getElementById('notifPreference').checked = Boolean(settings.notifPreference);
  }

  initForm();

  // 2. Inline field validation helper
  function validateAndDisplayInline(fieldId) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(`error-${fieldId}`);
    if (!input || !errorSpan) return null;

    const errorMsg = validateField(fieldId, input.value);

    if (errorMsg) {
      input.setAttribute('aria-invalid', 'true');
      errorSpan.textContent = errorMsg;
    } else {
      input.setAttribute('aria-invalid', 'false');
      errorSpan.textContent = '';
    }

    return errorMsg;
  }

  // 3. Attach blur event listeners for inline validation
  fields.forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (input) {
      input.addEventListener('blur', () => {
        validateAndDisplayInline(fieldId);
      });
    }
  });

  // 4. Form Submit Handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
      fullName: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      username: document.getElementById('username').value,
      notifPreference: document.getElementById('notifPreference').checked
    };

    const { errors, isValid } = validateForm(formData);

    // Update inline messages and aria-invalid attributes for all fields
    fields.forEach(fieldId => {
      const input = document.getElementById(fieldId);
      const errorSpan = document.getElementById(`error-${fieldId}`);
      if (errors[fieldId]) {
        input.setAttribute('aria-invalid', 'true');
        errorSpan.textContent = errors[fieldId];
      } else {
        input.setAttribute('aria-invalid', 'false');
        errorSpan.textContent = '';
      }
    });

    if (!isValid) {
      const errorKeys = Object.keys(errors);
      const firstInvalidFieldId = errorKeys[0];
      const firstInvalidInput = document.getElementById(firstInvalidFieldId);

      // Announce error summary to screen reader via live region
      if (liveRegion) {
        liveRegion.textContent = `Form submission failed. Please fix ${errorKeys.length} error${errorKeys.length > 1 ? 's' : ''}.`;
      }

      // Focus the first invalid field for keyboard navigation
      if (firstInvalidInput) {
        firstInvalidInput.focus();
      }

      showToast('Please resolve validation errors before saving.', 'error');
      return;
    }

    // Persist settings
    const isLocalStorage = saveSettings(formData);

    // Clear live region error message and announce success
    if (liveRegion) {
      liveRegion.textContent = 'Settings saved successfully.';
    }

    const successMessage = isLocalStorage
      ? 'Settings saved successfully!'
      : 'Settings saved to session memory (localStorage unavailable).';

    showToast(successMessage, 'success');
  });

  // 5. Reset button handler
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const defaults = resetSettings();
      document.getElementById('fullName').value = defaults.fullName;
      document.getElementById('email').value = defaults.email;
      document.getElementById('username').value = defaults.username;
      document.getElementById('notifPreference').checked = defaults.notifPreference;

      fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const errorSpan = document.getElementById(`error-${fieldId}`);
        if (input) input.setAttribute('aria-invalid', 'false');
        if (errorSpan) errorSpan.textContent = '';
      });

      if (liveRegion) {
        liveRegion.textContent = 'Settings reset to default values.';
      }

      showToast('Settings reset to default values.', 'success');
    });
  }

  // 6. Theme Toggle Handler
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);

      const sunIcon = themeToggleBtn.querySelector('.sun-icon');
      const moonIcon = themeToggleBtn.querySelector('.moon-icon');

      if (newTheme === 'light') {
        sunIcon?.classList.add('hidden');
        moonIcon?.classList.remove('hidden');
      } else {
        sunIcon?.classList.remove('hidden');
        moonIcon?.classList.add('hidden');
      }
    });
  }
});
