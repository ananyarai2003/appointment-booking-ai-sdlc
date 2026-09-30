/**
 * Appointment conflict detection.
 *
 * Detects scheduling conflicts based on date and time.
 */

/**
 * Checks if an appointment conflicts with existing appointments.
 *
 * Two different appointments must not occupy the same date and time slot.
 * When checking an existing appointment update, its own ID is excluded.
 *
 * @param {Object} appointmentData - The appointment to check (must include date and time)
 * @param {Array} existingAppointments - Array of existing appointments
 * @param {string|null} excludeId - Optional ID to exclude (for updates)
 * @returns {Object} Conflict result with { hasConflict: boolean, conflictingAppointment: Object|null }
 */
export function checkAppointmentConflict(appointmentData, existingAppointments, excludeId = null) {
  if (!appointmentData.date || !appointmentData.time) {
    // Cannot check for conflicts without date and time
    return {
      hasConflict: false,
      conflictingAppointment: null
    };
  }

  const conflictingAppointment = existingAppointments.find(appointment => {
    // Exclude the appointment being updated (same ID)
    if (excludeId && appointment.id === excludeId) {
      return false;
    }

    // Check if date and time match
    return (
      appointment.date === appointmentData.date &&
      appointment.time === appointmentData.time
    );
  });

  return {
    hasConflict: !!conflictingAppointment,
    conflictingAppointment: conflictingAppointment || null
  };
}

/**
 * Gets a user-friendly conflict message.
 *
 * @param {Object} conflictingAppointment - The conflicting appointment
 * @returns {string} A descriptive conflict message
 */
export function getConflictMessage(conflictingAppointment) {
  if (!conflictingAppointment) {
    return '';
  }

  const clientName = `${conflictingAppointment.firstName} ${conflictingAppointment.lastName}`.trim();
  const date = conflictingAppointment.date;
  const time = conflictingAppointment.time;

  return `This time slot is already booked${clientName ? ` for ${clientName}` : ''} on ${date} at ${time}`;
}
