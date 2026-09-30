/**
 * Centralized appointment state management hook.
 *
 * Manages loading, adding, updating, and deleting appointments
 * with reliable persistence through the storage layer.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  loadAppointments,
  saveAppointments,
  createAppointment,
  updateAppointmentById,
  deleteAppointmentById
} from '../storage/appointmentsStorage.js';

/**
 * Custom hook for managing appointment state.
 *
 * @returns {Object} Appointment state and operations
 */
export function useAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [persistenceError, setPersistenceError] = useState(null);

  // Load appointments on mount
  useEffect(() => {
    const loadedAppointments = loadAppointments();
    setAppointments(loadedAppointments);
    setLoading(false);
  }, []);

  /**
   * Persists appointments to storage with error handling.
   *
   * @param {Array} appointmentsToSave - The appointments to persist
   * @returns {boolean} True if successful, false otherwise
   */
  const persistAppointments = useCallback((appointmentsToSave) => {
    try {
      saveAppointments(appointmentsToSave);
      setPersistenceError(null);
      return true;
    } catch (error) {
      console.error('Failed to persist appointments:', error);
      setPersistenceError('Unable to save changes. Your data may not survive a page reload.');
      return false;
    }
  }, []);

  /**
   * Adds a new appointment.
   *
   * @param {Object} appointmentData - The appointment data (without ID)
   * @returns {Object} Result with { success: boolean, appointment: Object|null, error: string|null }
   */
  const addAppointment = useCallback((appointmentData) => {
    const newAppointment = createAppointment(appointmentData);
    const updatedAppointments = [...appointments, newAppointment];

    setAppointments(updatedAppointments);
    const persisted = persistAppointments(updatedAppointments);

    return {
      success: persisted,
      appointment: newAppointment,
      error: persisted ? null : 'Failed to save appointment'
    };
  }, [appointments, persistAppointments]);

  /**
   * Updates an existing appointment by ID.
   *
   * @param {string} id - The appointment ID
   * @param {Object} updatedData - The updated appointment data
   * @returns {Object} Result with { success: boolean, error: string|null }
   */
  const updateAppointment = useCallback((id, updatedData) => {
    const updatedAppointments = updateAppointmentById(appointments, id, updatedData);

    setAppointments(updatedAppointments);
    const persisted = persistAppointments(updatedAppointments);

    return {
      success: persisted,
      error: persisted ? null : 'Failed to save changes'
    };
  }, [appointments, persistAppointments]);

  /**
   * Deletes an appointment by ID.
   *
   * @param {string} id - The appointment ID to delete
   * @returns {Object} Result with { success: boolean, error: string|null }
   */
  const deleteAppointment = useCallback((id) => {
    const updatedAppointments = deleteAppointmentById(appointments, id);

    setAppointments(updatedAppointments);
    const persisted = persistAppointments(updatedAppointments);

    return {
      success: persisted,
      error: persisted ? null : 'Failed to delete appointment'
    };
  }, [appointments, persistAppointments]);

  /**
   * Clears the persistence error.
   */
  const clearPersistenceError = useCallback(() => {
    setPersistenceError(null);
  }, []);

  return {
    appointments,
    loading,
    persistenceError,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    clearPersistenceError
  };
}
