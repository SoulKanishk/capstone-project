import { test, describe } from 'node:test';
import assert from 'node:assert';
import { loadSettings, saveSettings, resetSettings, isLocalStorageAvailable, DEFAULT_SETTINGS } from '../src/js/storage.js';

describe('Storage Module Unit Tests', () => {

  test('detects local storage availability safely', () => {
    // In node environment without window, should return false safely without throwing
    const available = isLocalStorageAvailable();
    assert.strictEqual(typeof available, 'boolean');
  });

  test('returns DEFAULT_SETTINGS on initial load', () => {
    resetSettings();
    const settings = loadSettings();
    assert.deepStrictEqual(settings, DEFAULT_SETTINGS);
  });

  test('persists and retrieves saved settings via memory store fallback', () => {
    const newSettings = {
      fullName: 'Alice Smith',
      email: 'alice@example.com',
      username: 'alicesmith',
      notifPreference: false
    };

    saveSettings(newSettings);
    const loaded = loadSettings();

    assert.strictEqual(loaded.fullName, 'Alice Smith');
    assert.strictEqual(loaded.email, 'alice@example.com');
    assert.strictEqual(loaded.username, 'alicesmith');
    assert.strictEqual(loaded.notifPreference, false);
  });

  test('resets settings back to default', () => {
    resetSettings();
    const loaded = loadSettings();
    assert.deepStrictEqual(loaded, DEFAULT_SETTINGS);
  });

});
