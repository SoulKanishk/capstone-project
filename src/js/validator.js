/**
 * Validation module for Settings Form
 */

export const REGEX = {
  name: /^[a-zA-Z\s\.\-']+$/,
  username: /^[a-zA-Z0-9_]+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/
};

/**
 * Validates an individual field
 * @param {string} fieldId - The identifier of the field
 * @param {string|boolean} value - The input value to validate
 * @returns {string|null} Error message if invalid, null if valid
 */
export function validateField(fieldId, value) {
  const strValue = typeof value === 'string' ? value : '';

  switch (fieldId) {
    case 'fullName': {
      if (!strValue || strValue.trim().length === 0) {
        return 'Full Name is required.';
      }
      if (strValue.startsWith(' ') || strValue.endsWith(' ')) {
        return 'Full Name cannot contain leading or trailing whitespace.';
      }
      const trimmedName = strValue.trim();
      if (trimmedName.length < 2) {
        return 'Full Name must be at least 2 characters long.';
      }
      if (!REGEX.name.test(trimmedName)) {
        return 'Full Name contains invalid characters.';
      }
      return null;
    }

    case 'email': {
      const trimmedEmail = strValue.trim();
      if (!strValue || trimmedEmail.length === 0) {
        return 'Email address is required.';
      }
      if (!REGEX.email.test(trimmedEmail)) {
        return 'Please enter a valid email address (e.g. user@example.com).';
      }
      return null;
    }

    case 'username': {
      const trimmedUsername = strValue.trim();
      if (!strValue || trimmedUsername.length === 0) {
        return 'Username is required.';
      }
      if (!REGEX.username.test(trimmedUsername)) {
        return 'Username can only contain alphanumeric characters and underscores.';
      }
      if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
        return 'Username must be between 3 and 20 characters long.';
      }
      return null;
    }

    case 'notifPreference':
      return null;

    default:
      return null;
  }
}

/**
 * Validates all form fields
 * @param {object} formData - Object containing field values
 * @returns {object} { errors: Record<string, string>, isValid: boolean }
 */
export function validateForm(formData = {}) {
  const errors = {};
  const fields = ['fullName', 'email', 'username'];

  fields.forEach(fieldId => {
    const error = validateField(fieldId, formData[fieldId]);
    if (error) {
      errors[fieldId] = error;
    }
  });

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}
