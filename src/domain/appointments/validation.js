/**
 * Centralized appointment validation.
 *
 * Validates appointment fields and returns structured validation results
 * for UI display.
 */

/**
 * Validates an appointment's fields.
 *
 * @param {Object} appointment - The appointment data to validate
 * @returns {Object} Validation result with { isValid: boolean, errors: Object }
 */
export function validateAppointment(appointment) {
  const errors = {};

  // Validate firstName
  if (!appointment.firstName || appointment.firstName.trim() === '') {
    errors.firstName = 'First name is required';
  }

  // Validate lastName
  if (!appointment.lastName || appointment.lastName.trim() === '') {
    errors.lastName = 'Last name is required';
  }

  // Validate date
  if (!appointment.date || appointment.date.trim() === '') {
    errors.date = 'Date is required';
  } else if (!isValidDate(appointment.date)) {
    errors.date = 'Invalid date format';
  }

  // Validate time
  if (!appointment.time || appointment.time.trim() === '') {
    errors.time = 'Time is required';
  } else if (!isValidTime(appointment.time)) {
    errors.time = 'Invalid time format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates a date string in YYYY-MM-DD format.
 *
 * @param {string} dateString - The date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidDate(dateString) {
  // Check format: YYYY-MM-DD
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  const timestamp = date.getTime();

  // Check for NaN and ensure the date components match
  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    return false;
  }

  // Verify the date string matches the parsed date (catches invalid dates like 2023-02-31)
  const [year, month, day] = dateString.split('-').map(Number);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Validates a time string in HH:MM format (24-hour).
 *
 * @param {string} timeString - The time string to validate
 * @returns {boolean} True if valid, false otherwise
 */
function isValidTime(timeString) {
  // Check format: HH:MM
  const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timePattern.test(timeString);
}

/**
 * Gets a single validation error message for an appointment field.
 *
 * @param {Object} errors - The errors object from validateAppointment
 * @param {string} fieldName - The field name to get error for
 * @returns {string|null} The error message or null if no error
 */
export function getFieldError(errors, fieldName) {
  return errors[fieldName] || null;
}
