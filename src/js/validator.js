/**
 * Validation engine for Settings Form fields
 */

export const REGEX = {
  name: /^[a-zA-Z\s\.\-']+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^(\+?\d{1,4}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

/**
 * Evaluates password strength criteria
 * @param {string} password 
 * @returns {object} criteria breakdown and score (0 to 4)
 */
export function evaluatePasswordStrength(password) {
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const passedCount = Object.values(criteria).filter(Boolean).length;

  let label = "Very Weak";
  let scorePercent = 20;
  let colorClass = "var(--color-error)";

  if (password.length === 0) {
    label = "Very Weak";
    scorePercent = 0;
  } else if (passedCount <= 2) {
    label = "Weak";
    scorePercent = 35;
    colorClass = "var(--color-error)";
  } else if (passedCount === 3 || passedCount === 4) {
    label = "Medium";
    scorePercent = 65;
    colorClass = "var(--color-warning)";
  } else if (passedCount === 5) {
    label = "Strong";
    scorePercent = 100;
    colorClass = "var(--color-success)";
  }

  return { criteria, passedCount, label, scorePercent, colorClass };
}

/**
 * Validates a single field by field ID and value
 * @param {string} fieldId 
 * @param {string} value 
 * @param {object} allValues 
 * @returns {string|null} Error message string if invalid, null if valid
 */
export function validateField(fieldId, value, allValues = {}) {
  const trimmed = (value || '').trim();

  switch (fieldId) {
    case 'fullName':
      if (!trimmed) {
        return 'Full Name is required.';
      }
      if (trimmed.length < 2) {
        return 'Full Name must be at least 2 characters.';
      }
      if (!REGEX.name.test(trimmed)) {
        return 'Full Name contains invalid characters.';
      }
      return null;

    case 'username':
      if (!trimmed) {
        return 'Username is required.';
      }
      if (trimmed.length < 3 || trimmed.length > 20) {
        return 'Username must be between 3 and 20 characters.';
      }
      if (!REGEX.username.test(trimmed)) {
        return 'Username can only contain letters, numbers, and underscores.';
      }
      return null;

    case 'email':
      if (!trimmed) {
        return 'Email address is required.';
      }
      if (!REGEX.email.test(trimmed)) {
        return 'Please enter a valid email address (e.g. name@example.com).';
      }
      return null;

    case 'phone':
      if (trimmed && !REGEX.phone.test(trimmed)) {
        return 'Please enter a valid phone number.';
      }
      return null;

    case 'website':
      if (trimmed && !REGEX.url.test(trimmed)) {
        return 'Website must be a valid URL starting with http:// or https://';
      }
      return null;

    case 'bio':
      if (value && value.length > 250) {
        return 'Bio cannot exceed 250 characters.';
      }
      return null;

    case 'currentPassword':
      if ((allValues.newPassword && allValues.newPassword.length > 0) && !trimmed) {
        return 'Current password is required to set a new password.';
      }
      return null;

    case 'newPassword':
      if (trimmed.length > 0) {
        const { criteria } = evaluatePasswordStrength(trimmed);
        if (!criteria.length) {
          return 'New password must be at least 8 characters long.';
        }
        if (!(criteria.uppercase && criteria.lowercase && criteria.number && criteria.special)) {
          return 'New password does not meet all security complexity requirements.';
        }
      }
      return null;

    case 'confirmPassword':
      if (allValues.newPassword && allValues.newPassword.length > 0) {
        if (!trimmed) {
          return 'Please confirm your new password.';
        }
        if (trimmed !== allValues.newPassword) {
          return 'Passwords do not match.';
        }
      }
      return null;

    default:
      return null;
  }
}

/**
 * Validates the entire form state
 * @param {object} formData 
 * @returns {object} errors mapped by fieldId, and isValid boolean flag
 */
export function validateForm(formData) {
  const errors = {};

  const fieldIds = [
    'fullName',
    'username',
    'email',
    'phone',
    'website',
    'bio',
    'currentPassword',
    'newPassword',
    'confirmPassword'
  ];

  fieldIds.forEach(fieldId => {
    const errorMsg = validateField(fieldId, formData[fieldId], formData);
    if (errorMsg) {
      errors[fieldId] = errorMsg;
    }
  });

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}
