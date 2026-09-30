import React, {  useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import { useAppointments } from './state/useAppointments.js';
import { validateAppointment } from './domain/appointments/validation.js';
import { checkAppointmentConflict, getConflictMessage } from './domain/appointments/conflicts.js';

function AddBook() {
  const navigate = useNavigate();
  const { appointments, addAppointment } = useAppointments();

  const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        date: '',
        time: '',
        notes: ''
    });
  const [validationErrors, setValidationErrors] = useState({});
  const [conflictError, setConflictError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clear previous errors
        setValidationErrors({});
        setConflictError(null);
        setSubmitError(null);

        // Validate the appointment
        const validation = validateAppointment(formData);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }

        // Check for conflicts
        const conflict = checkAppointmentConflict(formData, appointments);
        if (conflict.hasConflict) {
            setConflictError(getConflictMessage(conflict.conflictingAppointment));
            return;
        }

        // Add the appointment
        const result = addAppointment(formData);

        if (result.success) {
            // Navigate back to home on success
            navigate('/');
        } else {
            // Show error if persistence failed
            setSubmitError(result.error || 'Failed to save appointment');
        }
    };
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Book a New Appointment</h1>

      {/* Error Messages */}
      {(submitError || conflictError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            {submitError || conflictError}
          </p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900">Client Information</h2>
          
          <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border ${validationErrors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.firstName}
              />
              {validationErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border ${validationErrors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.lastName}
              />
              {validationErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
              )}
            </div>

           
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-medium text-gray-900">Appointment Details</h2>
          
          <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border ${validationErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.date}
              />
              {validationErrors.date && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border ${validationErrors.time ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.time}
              />
              {validationErrors.time && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.time}</p>
              )}
            </div>

            
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <div className="mt-1">
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Any special requirements or notes..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="rounded-md border border-gray-300 py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddBook;