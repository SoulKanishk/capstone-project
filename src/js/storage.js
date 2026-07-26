/**
 * LocalStorage manager with in-memory fallback
 */

const STORAGE_KEY = 'capstone_user_settings_v1';

export const DEFAULT_SETTINGS = {
  fullName: 'Jane Doe',
  email: 'jane.doe@example.com',
  username: 'janedoe',
  notifPreference: true
};

// In-memory fallback store when localStorage is disabled or throws an exception
const memoryStore = new Map();

/**
 * Checks if localStorage is functional
 * @returns {boolean}
 */
export function isLocalStorageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Loads settings from persistent storage or fallback
 * @returns {object} Settings object
 */
export function loadSettings() {
  if (isLocalStorageAvailable()) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('LocalStorage read error, falling back to memory store:', e);
    }
  }

  if (memoryStore.has(STORAGE_KEY)) {
    return { ...DEFAULT_SETTINGS, ...memoryStore.get(STORAGE_KEY) };
  }

  return { ...DEFAULT_SETTINGS };
}

/**
 * Saves settings to persistent storage or fallback
 * @param {object} settings
 * @returns {boolean} True if saved via localStorage, false if saved via in-memory fallback
 */
export function saveSettings(settings) {
  const safeData = {
    fullName: (settings.fullName || '').trim(),
    email: (settings.email || '').trim(),
    username: (settings.username || '').trim(),
    notifPreference: Boolean(settings.notifPreference)
  };

  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
      return true;
    } catch (e) {
      console.warn('LocalStorage write error, using in-memory store fallback:', e);
    }
  }

  memoryStore.set(STORAGE_KEY, safeData);
  return false;
}

/**
 * Resets storage to initial state
 */
export function resetSettings() {
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }
  memoryStore.delete(STORAGE_KEY);
  return { ...DEFAULT_SETTINGS };
}
