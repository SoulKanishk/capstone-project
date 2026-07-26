import { loadSettings, saveSettings, resetSettings, DEFAULT_SETTINGS } from './storage.js';
import { validateField, validateForm, evaluatePasswordStrength } from './validator.js';
import { showToast } from './toast.js';

class SettingsApp {
  constructor() {
    this.initialState = {};
    this.currentState = {};
    this.touchedFields = new Set();
    this.activeTab = 'profile';

    this.initElements();
    this.initEventListeners();
    this.loadInitialData();
  }

  initElements() {
    this.form = document.getElementById('settings-form');
    this.navTabs = document.querySelectorAll('.nav-tab');
    this.tabPanels = document.querySelectorAll('.tab-panel');
    
    // Header actions
    this.btnResetAll = document.getElementById('btn-reset-all');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // Unsaved bar
    this.unsavedBar = document.getElementById('unsaved-bar');
    this.btnDiscard = document.getElementById('btn-discard');
    this.btnSave = document.getElementById('btn-save');

    // Avatar
    this.btnChangeAvatar = document.getElementById('btn-change-avatar');
    this.avatarContainer = document.getElementById('avatar-container');
    this.avatarInitials = document.getElementById('avatar-initials');

    // Bio Counter
    this.bioInput = document.getElementById('bio');
    this.bioCounter = document.getElementById('bio-counter');

    // Password Meter
    this.newPasswordInput = document.getElementById('newPassword');
    this.meterBar = document.getElementById('meter-bar');
    this.meterLabelText = document.getElementById('meter-label-text');

    // Theme & Accent controls
    this.themeRadioOptions = document.querySelectorAll('input[name="themeMode"]');
    this.accentSwatches = document.querySelectorAll('.accent-swatch');
  }

  initEventListeners() {
    // Tab switching
    this.navTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTab = tab.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Theme toggle button in header
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        this.syncThemeRadios(newTheme);
        this.markDirty();
      });
    }

    // Theme radio selection
    this.themeRadioOptions.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.setTheme(e.target.value);
        this.markDirty();
      });
    });

    // Accent color selection
    this.accentSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const accent = swatch.getAttribute('data-accent');
        this.setAccent(accent);
        this.markDirty();
      });
    });

    // Password visibility toggles
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        const eyeIcon = btn.querySelector('.eye-icon');
        const eyeOffIcon = btn.querySelector('.eye-off-icon');

        if (eyeIcon && eyeOffIcon) {
          eyeIcon.classList.toggle('hidden', isPassword);
          eyeOffIcon.classList.toggle('hidden', !isPassword);
        }
      });
    });

    // Real-time password strength update
    if (this.newPasswordInput) {
      this.newPasswordInput.addEventListener('input', (e) => {
        this.updatePasswordMeter(e.target.value);
      });
    }

    // Bio character counter
    if (this.bioInput) {
      this.bioInput.addEventListener('input', (e) => {
        const len = e.target.value.length;
        this.bioCounter.textContent = `${len} / 250`;
        if (len > 250) {
          this.bioCounter.style.color = 'var(--color-error)';
        } else {
          this.bioCounter.style.color = 'var(--text-muted)';
        }
      });
    }

    // Avatar Randomizer
    if (this.btnChangeAvatar) {
      this.btnChangeAvatar.addEventListener('click', () => {
        const colors = [
          'linear-gradient(135deg, #6366f1, #8b5cf6)',
          'linear-gradient(135deg, #10b981, #059669)',
          'linear-gradient(135deg, #f43f5e, #e11d48)',
          'linear-gradient(135deg, #f59e0b, #d97706)',
          'linear-gradient(135deg, #06b6d4, #3b82f6)'
        ];
        const randomBg = colors[Math.floor(Math.random() * colors.length)];
        this.avatarContainer.style.background = randomBg;
        showToast('Avatar background color updated!', 'info', 2000);
        this.markDirty();
      });
    }

    // Form inputs real-time & blur validation
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        if (input.name) {
          this.touchedFields.add(input.name);
          this.validateSingleField(input.name);
        }
      });

      input.addEventListener('input', () => {
        this.markDirty();
        if (input.name && this.touchedFields.has(input.name)) {
          this.validateSingleField(input.name);
        }
      });
    });

    // Form submission
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Discard changes
    if (this.btnDiscard) {
      this.btnDiscard.addEventListener('click', () => {
        this.populateForm(this.initialState);
        this.clearAllErrors();
        this.unsavedBar.classList.add('hidden');
        showToast('Unsaved changes discarded', 'info', 3000);
      });
    }

    // Reset Defaults
    if (this.btnResetAll) {
      this.btnResetAll.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings to initial defaults?')) {
          const defaults = resetSettings();
          this.initialState = { ...defaults };
          this.populateForm(defaults);
          this.clearAllErrors();
          this.unsavedBar.classList.add('hidden');
          showToast('All settings reset to default values', 'warning');
        }
      });
    }
  }

  loadInitialData() {
    const loaded = loadSettings();
    this.initialState = { ...loaded };
    this.populateForm(loaded);
    this.unsavedBar.classList.add('hidden');
  }

  populateForm(data) {
    this.currentState = { ...data };

    // Fill inputs
    Object.keys(data).forEach(key => {
      const element = this.form.elements[key];
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = Boolean(data[key]);
        } else if (element instanceof NodeList || element.type === 'radio') {
          const radio = Array.from(this.themeRadioOptions).find(r => r.value === data[key]);
          if (radio) radio.checked = true;
        } else {
          element.value = data[key];
        }
      }
    });

    // Init Theme & Accent
    if (data.themeMode) this.setTheme(data.themeMode);
    if (data.accentColor) this.setAccent(data.accentColor);

    // Init Initials
    if (data.fullName && this.avatarInitials) {
      const names = data.fullName.trim().split(' ');
      const initials = names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
      this.avatarInitials.textContent = initials || 'JD';
    }

    // Init Bio Counter
    if (this.bioInput && this.bioCounter) {
      this.bioCounter.textContent = `${this.bioInput.value.length} / 250`;
    }

    // Reset Password meter
    this.updatePasswordMeter(data.newPassword || '');
  }

  getFormData() {
    const data = {};
    const formData = new FormData(this.form);

    // Form data entries
    for (let [key, val] of formData.entries()) {
      data[key] = val;
    }

    // Handle checkboxes explicit boolean
    const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      if (cb.name) {
        data[cb.name] = cb.checked;
      }
    });

    // Add accent color
    const activeSwatch = document.querySelector('.accent-swatch.active');
    data.accentColor = activeSwatch ? activeSwatch.getAttribute('data-accent') : 'indigo';

    return data;
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    this.navTabs.forEach(t => {
      const isTarget = t.getAttribute('data-tab') === tabId;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', isTarget);
    });

    this.tabPanels.forEach(panel => {
      const isTarget = panel.id === `panel-${tabId}`;
      panel.classList.toggle('active', isTarget);
    });
  }

  setTheme(theme) {
    let activeTheme = theme;
    if (theme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', activeTheme);
  }

  syncThemeRadios(theme) {
    this.themeRadioOptions.forEach(r => {
      r.checked = (r.value === theme);
    });
  }

  setAccent(accent) {
    document.documentElement.setAttribute('data-accent', accent);
    this.accentSwatches.forEach(s => {
      s.classList.toggle('active', s.getAttribute('data-accent') === accent);
    });
  }

  updatePasswordMeter(password) {
    const { criteria, label, scorePercent, colorClass } = evaluatePasswordStrength(password);

    if (this.meterBar) {
      this.meterBar.style.width = `${scorePercent}%`;
      this.meterBar.style.backgroundColor = colorClass;
    }

    if (this.meterLabelText) {
      this.meterLabelText.textContent = password ? label : 'Very Weak';
      this.meterLabelText.style.color = password ? colorClass : 'var(--text-muted)';
    }

    // Update rule checklist items
    const updateRuleItem = (id, isValid) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.toggle('valid', isValid);
        const iconSpan = el.querySelector('span');
        if (iconSpan) iconSpan.textContent = isValid ? '✓' : '✕';
      }
    };

    updateRuleItem('rule-length', criteria.length);
    updateRuleItem('rule-uppercase', criteria.uppercase);
    updateRuleItem('rule-lowercase', criteria.lowercase);
    updateRuleItem('rule-number', criteria.number);
    updateRuleItem('rule-special', criteria.special);
  }

  markDirty() {
    this.unsavedBar.classList.remove('hidden');
  }

  validateSingleField(fieldId) {
    const formData = this.getFormData();
    const errorMsg = validateField(fieldId, formData[fieldId], formData);

    const group = document.getElementById(`group-${fieldId}`);
    const errorEl = document.getElementById(`error-${fieldId}`);

    if (group && errorEl) {
      if (errorMsg) {
        group.classList.add('has-error');
        errorEl.textContent = errorMsg;
      } else {
        group.classList.remove('has-error');
        errorEl.textContent = '';
      }
    }

    this.updateTabBadges();
    return !errorMsg;
  }

  clearAllErrors() {
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('has-error');
    });
    document.querySelectorAll('.error-msg').forEach(el => {
      el.textContent = '';
    });
    this.updateTabBadges();
  }

  updateTabBadges() {
    const formData = this.getFormData();
    const { errors } = validateForm(formData);

    const profileFields = ['fullName', 'username', 'email', 'phone', 'website', 'bio'];
    const securityFields = ['currentPassword', 'newPassword', 'confirmPassword'];

    const hasProfileError = profileFields.some(f => errors[f]);
    const hasSecurityError = securityFields.some(f => errors[f]);

    const badgeProfile = document.getElementById('badge-profile');
    const badgeSecurity = document.getElementById('badge-security');

    if (badgeProfile) badgeProfile.classList.toggle('hidden', !hasProfileError);
    if (badgeSecurity) badgeSecurity.classList.toggle('hidden', !hasSecurityError);
  }

  handleFormSubmit() {
    const formData = this.getFormData();
    const { errors, isValid } = validateForm(formData);

    // Touch all fields to render error messages
    Object.keys(formData).forEach(key => this.touchedFields.add(key));

    if (!isValid) {
      // Highlight errors across all fields
      Object.keys(errors).forEach(fieldId => {
        const group = document.getElementById(`group-${fieldId}`);
        const errorEl = document.getElementById(`error-${fieldId}`);
        if (group && errorEl) {
          group.classList.add('has-error');
          errorEl.textContent = errors[fieldId];
        }
      });

      this.updateTabBadges();

      // Switch to first tab containing error
      const profileFields = ['fullName', 'username', 'email', 'phone', 'website', 'bio'];
      const securityFields = ['currentPassword', 'newPassword', 'confirmPassword'];

      if (profileFields.some(f => errors[f])) {
        this.switchTab('profile');
      } else if (securityFields.some(f => errors[f])) {
        this.switchTab('security');
      }

      showToast(`Form validation failed (${Object.keys(errors).length} errors found)`, 'error');
      return;
    }

    // If valid: Save settings
    saveSettings(formData);
    this.initialState = { ...formData };
    
    // Clear password inputs after saving
    const passwordInputs = ['currentPassword', 'newPassword', 'confirmPassword'];
    passwordInputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = '';
    });
    this.updatePasswordMeter('');

    this.clearAllErrors();
    this.unsavedBar.classList.add('hidden');

    showToast('Settings saved successfully!', 'success');
  }
}

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SettingsApp();
});
