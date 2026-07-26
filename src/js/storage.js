/**
 * LocalStorage manager for Settings Application
 */

const STORAGE_KEY = 'app_user_settings_v1';

export const DEFAULT_SETTINGS = {
  // Profile
  fullName: 'Jane Doe',
  username: 'janedoe',
  email: 'jane.doe@example.com',
  phone: '+1 (555) 234-5678',
  website: 'https://janedoe.dev',
  bio: 'Senior Software Engineer passionate about UI/UX design, web performance, and modern web applications.',
  avatarInitials: 'JD',

  // Security
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  enable2FA: true,

  // Notifications
  notifSecurity: true,
  notifProduct: true,
  notifMarketing: false,
  notifFrequency: 'daily',
  notifDesktop: true,

  // Preferences & Theme
  themeMode: 'dark',
  accentColor: 'indigo',
  language: 'en-US',
  timezone: 'America/Los_Angeles'
};

/**
 * Load settings from localStorage or fallback to defaults
 * @returns {object} Settings object
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.error('Failed to parse local settings:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save settings object to localStorage
 * @param {object} settings 
 */
export function saveSettings(settings) {
  try {
    // Exclude password fields from persistent storage for security best practice
    const safeSettings = { ...settings };
    delete safeSettings.currentPassword;
    delete safeSettings.newPassword;
    delete safeSettings.confirmPassword;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeSettings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}

/**
 * Reset local storage to initial default settings
 */
export function resetSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear local storage:', err);
  }
  return { ...DEFAULT_SETTINGS };
}
