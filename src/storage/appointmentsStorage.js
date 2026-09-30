/**
 * Centralized localStorage operations for appointments.
 *
 * Handles loading, saving, normalizing, and migrating appointment records.
 */

import { generateAppointmentId } from '../domain/appointments/ids.js';

const STORAGE_KEY = 'appointments';

/**
 * Normalizes an appointment record to ensure it has all required fields.
 * Generates a unique ID for records that don't have one (legacy migration).
 *
 * @param {Object} appointment - The appointment record to normalize
 * @returns {Object} Normalized appointment with guaranteed id field
 */
function normalizeAppointment(appointment) {
  return {
    id: appointment.id || generateAppointmentId(),
    firstName: appointment.firstName || '',
    lastName: appointment.lastName || '',
    date: appointment.date || '',
    time: appointment.time || '',
    notes: appointment.notes || ''
  };
}

/**
 * Loads appointments from localStorage.
 * Safely handles malformed data and migrates legacy records without IDs.
 *
 * @returns {Array} Array of normalized appointment objects
 */
export function loadAppointments() {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      return [];
    }

    const parsedData = JSON.parse(storedData);

    if (!Array.isArray(parsedData)) {
      console.warn('localStorage appointments data is not an array. Returning empty array.');
      return [];
    }

    // Normalize all appointments (migrates legacy records without IDs)
    const normalizedAppointments = parsedData.map(normalizeAppointment);

    // Check if migration occurred (any record was missing an ID)
    const migrationOccurred = parsedData.some(appointment => !appointment.id);

    // If migration occurred, persist the normalized records
    if (migrationOccurred) {
      saveAppointments(normalizedAppointments);
      console.info('Legacy appointment records migrated with stable IDs.');
    }

    return normalizedAppointments;
  } catch (error) {
    console.error('Failed to load appointments from localStorage:', error);
    return [];
  }
}

/**
 * Saves appointments to localStorage.
 *
 * @param {Array} appointments - Array of appointment objects to save
 */
export function saveAppointments(appointments) {
  try {
    if (!Array.isArray(appointments)) {
      console.error('Cannot save appointments: data is not an array');
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  } catch (error) {
    console.error('Failed to save appointments to localStorage:', error);
  }
}

/**
 * Creates a new appointment with a unique ID.
 *
 * @param {Object} appointmentData - The appointment data (without ID)
 * @returns {Object} Normalized appointment with generated ID
 */
export function createAppointment(appointmentData) {
  return normalizeAppointment(appointmentData);
}

/**
 * Finds an appointment by ID.
 *
 * @param {Array} appointments - Array of appointments to search
 * @param {string} id - The appointment ID to find
 * @returns {Object|undefined} The found appointment or undefined
 */
export function findAppointmentById(appointments, id) {
  return appointments.find(appointment => appointment.id === id);
}

/**
 * Updates an appointment by ID.
 *
 * @param {Array} appointments - Array of appointments
 * @param {string} id - The ID of the appointment to update
 * @param {Object} updatedData - The updated appointment data
 * @returns {Array} New array with the updated appointment
 */
export function updateAppointmentById(appointments, id, updatedData) {
  return appointments.map(appointment => {
    if (appointment.id === id) {
      return {
        ...appointment,
        ...updatedData,
        id // Preserve the ID
      };
    }
    return appointment;
  });
}

/**
 * Deletes an appointment by ID.
 *
 * @param {Array} appointments - Array of appointments
 * @param {string} id - The ID of the appointment to delete
 * @returns {Array} New array without the deleted appointment
 */
export function deleteAppointmentById(appointments, id) {
  return appointments.filter(appointment => appointment.id !== id);
}
