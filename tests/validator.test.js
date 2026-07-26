import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validateField, validateForm } from '../src/js/validator.js';

describe('Validator Module Unit Tests', () => {

  describe('Full Name Validation', () => {
    test('rejects empty name', () => {
      const err = validateField('fullName', '');
      assert.strictEqual(err, 'Full Name is required.');
    });

    test('rejects whitespace-only name', () => {
      const err = validateField('fullName', '   ');
      assert.strictEqual(err, 'Full Name is required.');
    });

    test('rejects leading whitespace', () => {
      const err = validateField('fullName', ' John Doe');
      assert.strictEqual(err, 'Full Name cannot contain leading or trailing whitespace.');
    });

    test('rejects trailing whitespace', () => {
      const err = validateField('fullName', 'John Doe ');
      assert.strictEqual(err, 'Full Name cannot contain leading or trailing whitespace.');
    });

    test('rejects name shorter than 2 characters', () => {
      const err = validateField('fullName', 'J');
      assert.strictEqual(err, 'Full Name must be at least 2 characters long.');
    });

    test('rejects invalid characters in name', () => {
      const err = validateField('fullName', 'Jane Doe 123!');
      assert.strictEqual(err, 'Full Name contains invalid characters.');
    });

    test('accepts valid full name', () => {
      const err = validateField('fullName', 'Jane Doe');
      assert.strictEqual(err, null);
    });
  });

  describe('Email Validation', () => {
    test('rejects empty email', () => {
      const err = validateField('email', '');
      assert.strictEqual(err, 'Email address is required.');
    });

    test('rejects whitespace email', () => {
      const err = validateField('email', '   ');
      assert.strictEqual(err, 'Email address is required.');
    });

    test('rejects invalid email formats', () => {
      const invalidEmails = ['plainaddress', 'user@', 'user@domain', 'user@.com', 'user@domain..com', '@domain.com'];
      invalidEmails.forEach(email => {
        const err = validateField('email', email);
        assert.ok(err && err.includes('valid email address'), `Failed for email: ${email}`);
      });
    });

    test('accepts valid email address', () => {
      const validEmails = ['user@example.com', 'jane.doe@company.co.uk', 'john_123@sub.domain.org'];
      validEmails.forEach(email => {
        const err = validateField('email', email);
        assert.strictEqual(err, null, `Should be valid: ${email}`);
      });
    });
  });

  describe('Username Validation', () => {
    test('rejects empty username', () => {
      const err = validateField('username', '');
      assert.strictEqual(err, 'Username is required.');
    });

    test('rejects username with invalid characters (spaces, hyphens, special chars)', () => {
      const invalidUsernames = ['jane doe', 'user-name', 'user@123', 'admin!'];
      invalidUsernames.forEach(username => {
        const err = validateField('username', username);
        assert.strictEqual(err, 'Username can only contain alphanumeric characters and underscores.', `Failed for: ${username}`);
      });
    });

    test('rejects username too short (<3 chars)', () => {
      const err = validateField('username', 'ab');
      assert.strictEqual(err, 'Username must be between 3 and 20 characters long.');
    });

    test('rejects username too long (>20 chars)', () => {
      const err = validateField('username', 'a'.repeat(21));
      assert.strictEqual(err, 'Username must be between 3 and 20 characters long.');
    });

    test('accepts valid usernames', () => {
      const validUsernames = ['janedoe', 'jane_doe', 'user123', '_user_name_'];
      validUsernames.forEach(username => {
        const err = validateField('username', username);
        assert.strictEqual(err, null, `Should be valid: ${username}`);
      });
    });
  });

  describe('Form Validation', () => {
    test('rejects empty form submission', () => {
      const result = validateForm({ fullName: '', email: '', username: '' });
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.fullName);
      assert.ok(result.errors.email);
      assert.ok(result.errors.username);
    });

    test('passes completely valid form submission', () => {
      const result = validateForm({
        fullName: 'Jane Doe',
        email: 'jane.doe@example.com',
        username: 'janedoe'
      });
      assert.strictEqual(result.isValid, true);
      assert.deepStrictEqual(result.errors, {});
    });
  });

});
