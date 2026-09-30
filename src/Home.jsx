import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppointments } from './state/useAppointments.js';
import { validateAppointment } from './domain/appointments/validation.js';
import { checkAppointmentConflict, getConflictMessage } from './domain/appointments/conflicts.js';

const Home = () => {
    const {
        appointments,
        loading,
        persistenceError,
        updateAppointment,
        deleteAppointment,
        clearPersistenceError
    } = useAppointments();

    const [filterDate, setFilterDate] = useState('');

    // Edit state (firstName, lastName, notes only)
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        notes: ''
    });
    const [editValidationErrors, setEditValidationErrors] = useState({});

    // Reschedule state (date and time only)
    const [reschedulingId, setReschedulingId] = useState(null);
    const [rescheduleForm, setRescheduleForm] = useState({
        date: '',
        time: ''
    });
    const [rescheduleValidationErrors, setRescheduleValidationErrors] = useState({});
    const [rescheduleConflictError, setRescheduleConflictError] = useState(null);

    // Filter appointments by selected date.
    const filteredAppointments = appointments.filter((appointment) => {
        if (!filterDate) {
            return true;
        }

        return appointment.date === filterDate;
    });

    // Delete an appointment by ID.
    const handleDeleteAppointment = (appointmentId) => {
        const result = deleteAppointment(appointmentId);

        // If the deleted appointment was being edited, exit edit mode.
        if (editingId === appointmentId) {
            setEditingId(null);
        }

        if (!result.success) {
            // Persistence error is tracked by the hook
            console.error('Failed to delete appointment');
        }
    };

    // Start editing an appointment (firstName, lastName, notes only)
    const startEditing = (appointment) => {
        setEditingId(appointment.id);
        setEditForm({
            firstName: appointment.firstName || '',
            lastName: appointment.lastName || '',
            notes: appointment.notes || ''
        });
        setEditValidationErrors({});
    };

    // Save edited appointment (firstName, lastName, notes only)
    const saveEdit = (appointmentId) => {
        // Validate only the editable fields
        const errors = {};
        if (!editForm.firstName || editForm.firstName.trim() === '') {
            errors.firstName = 'First name is required';
        }
        if (!editForm.lastName || editForm.lastName.trim() === '') {
            errors.lastName = 'Last name is required';
        }

        if (Object.keys(errors).length > 0) {
            setEditValidationErrors(errors);
            return;
        }

        // Clear any previous errors
        setEditValidationErrors({});

        // Update only firstName, lastName, and notes (date/time preserved)
        const result = updateAppointment(appointmentId, editForm);

        if (result.success) {
            setEditingId(null);
            setEditForm({
                firstName: '',
                lastName: '',
                notes: ''
            });
        } else {
            console.error('Failed to save appointment');
        }
    };

    // Handle changes to the edit form.
    const handleEditChange = (event) => {
        const { name, value } = event.target;

        setEditForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    };

    // Start rescheduling an appointment (date and time only)
    const startRescheduling = (appointment) => {
        setReschedulingId(appointment.id);
        setRescheduleForm({
            date: appointment.date || '',
            time: appointment.time || ''
        });
        setRescheduleValidationErrors({});
        setRescheduleConflictError(null);
    };

    // Handle changes to the reschedule form
    const handleRescheduleChange = (event) => {
        const { name, value } = event.target;

        setRescheduleForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    };

    // Save rescheduled appointment (date and time only)
    const saveReschedule = (appointmentId) => {
        // Find the current appointment to get complete data
        const currentAppointment = appointments.find(apt => apt.id === appointmentId);
        if (!currentAppointment) {
            console.error('Appointment not found');
            return;
        }

        // Create a complete appointment object for validation
        const rescheduleData = {
            firstName: currentAppointment.firstName,
            lastName: currentAppointment.lastName,
            date: rescheduleForm.date,
            time: rescheduleForm.time,
            notes: currentAppointment.notes
        };

        // Validate date and time
        const validation = validateAppointment(rescheduleData);
        const dateTimeErrors = {};
        if (validation.errors.date) {
            dateTimeErrors.date = validation.errors.date;
        }
        if (validation.errors.time) {
            dateTimeErrors.time = validation.errors.time;
        }

        if (Object.keys(dateTimeErrors).length > 0) {
            setRescheduleValidationErrors(dateTimeErrors);
            return;
        }

        // Check for conflicts (exclude the current appointment being rescheduled)
        const conflict = checkAppointmentConflict(rescheduleData, appointments, appointmentId);
        if (conflict.hasConflict) {
            setRescheduleConflictError(getConflictMessage(conflict.conflictingAppointment));
            return;
        }

        // Clear any previous errors
        setRescheduleValidationErrors({});
        setRescheduleConflictError(null);

        // Update only date and time (preserve firstName, lastName, notes, and ID)
        const result = updateAppointment(appointmentId, {
            date: rescheduleForm.date,
            time: rescheduleForm.time
        });

        if (result.success) {
            setReschedulingId(null);
            setRescheduleForm({
                date: '',
                time: ''
            });
        } else {
            console.error('Failed to reschedule appointment');
        }
    };

    // Cancel rescheduling
    const cancelReschedule = () => {
        setReschedulingId(null);
        setRescheduleForm({
            date: '',
            time: ''
        });
        setRescheduleValidationErrors({});
        setRescheduleConflictError(null);
    };

    const styleTh =
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto mt-10 p-6 text-center">
                <p>Loading appointments...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6">

            {/* Persistence Error Banner */}
            {persistenceError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex justify-between items-start">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">
                                    {persistenceError}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={clearPersistenceError}
                            className="ml-3 text-red-400 hover:text-red-600"
                        >
                            <span className="sr-only">Dismiss</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Appointments List
                </h1>

                <Link
                    to="/add"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Add New Appointment
                </Link>
            </div>

            {/* Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label
                        htmlFor="filterDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Filter by Date
                    </label>

                    <input
                        id="filterDate"
                        type="date"
                        value={filterDate}
                        onChange={(event) =>
                            setFilterDate(event.target.value)
                        }
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                {filterDate && (
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={() => setFilterDate('')}
                            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            Clear Filter
                        </button>
                    </div>
                )}
            </div>

            {/* Appointment Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className={styleTh}>Name</th>
                            <th className={styleTh}>Date</th>
                            <th className={styleTh}>Time</th>
                            <th className={styleTh}>Notes</th>
                            <th className={styleTh}>Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">

                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    No appointments available
                                </td>
                            </tr>
                        ) : (
                            filteredAppointments.map((appointment) => {

                                const isEditing =
                                    editingId === appointment.id;

                                return (
                                    <tr
                                        key={appointment.id}
                                        className="hover:bg-gray-50"
                                    >

                                        {isEditing ? (
                                            <>
                                                {/* Name - Editable */}
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        value={editForm.firstName}
                                                        onChange={handleEditChange}
                                                        placeholder="First name"
                                                        className={`w-full p-1 border rounded ${editValidationErrors.firstName ? 'border-red-500' : ''}`}
                                                    />
                                                    {editValidationErrors.firstName && (
                                                        <p className="text-xs text-red-600 mt-1">{editValidationErrors.firstName}</p>
                                                    )}

                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        value={editForm.lastName}
                                                        onChange={handleEditChange}
                                                        placeholder="Last name"
                                                        className={`w-full p-1 border rounded mt-1 ${editValidationErrors.lastName ? 'border-red-500' : ''}`}
                                                    />
                                                    {editValidationErrors.lastName && (
                                                        <p className="text-xs text-red-600 mt-1">{editValidationErrors.lastName}</p>
                                                    )}
                                                </td>

                                                {/* Date - Read Only (use Reschedule to change) */}
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-700">{appointment.date}</span>
                                                    <p className="text-xs text-gray-500 mt-1">Use Reschedule to change</p>
                                                </td>

                                                {/* Time - Read Only (use Reschedule to change) */}
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-700">{appointment.time}</span>
                                                    <p className="text-xs text-gray-500 mt-1">Use Reschedule to change</p>
                                                </td>

                                                {/* Notes */}
                                                <td className="px-6 py-4">
                                                    <textarea
                                                        name="notes"
                                                        value={editForm.notes}
                                                        onChange={handleEditChange}
                                                        className="w-full p-1 border rounded"
                                                        rows="2"
                                                    />
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            saveEdit(
                                                                appointment.id
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-900 mr-2"
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingId(null)
                                                        }
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        Cancel
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                {/* Name */}
                                                <td className="px-6 py-4">
                                                    {appointment.firstName}{' '}
                                                    {appointment.lastName}
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4">
                                                    {appointment.date}
                                                </td>

                                                {/* Time */}
                                                <td className="px-6 py-4">
                                                    {appointment.time}
                                                </td>

                                                {/* Notes */}
                                                <td className="px-6 py-4 max-w-xs truncate">
                                                    {appointment.notes}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startEditing(
                                                                appointment
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-900 mr-2"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            startRescheduling(
                                                                appointment
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-900 mr-2"
                                                    >
                                                        Reschedule
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteAppointment(
                                                                appointment.id
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })
                        )}

                    </tbody>
                </table>
            </div>

            {/* Reschedule Modal */}
            {reschedulingId && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Reschedule Appointment</h3>

                        {/* Conflict Error */}
                        {rescheduleConflictError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-800">{rescheduleConflictError}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* New Date */}
                            <div>
                                <label htmlFor="rescheduleDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Date
                                </label>
                                <input
                                    type="date"
                                    id="rescheduleDate"
                                    name="date"
                                    value={rescheduleForm.date}
                                    onChange={handleRescheduleChange}
                                    className={`w-full p-2 border rounded-md ${rescheduleValidationErrors.date ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {rescheduleValidationErrors.date && (
                                    <p className="mt-1 text-sm text-red-600">{rescheduleValidationErrors.date}</p>
                                )}
                            </div>

                            {/* New Time */}
                            <div>
                                <label htmlFor="rescheduleTime" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Time
                                </label>
                                <input
                                    type="time"
                                    id="rescheduleTime"
                                    name="time"
                                    value={rescheduleForm.time}
                                    onChange={handleRescheduleChange}
                                    className={`w-full p-2 border rounded-md ${rescheduleValidationErrors.time ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {rescheduleValidationErrors.time && (
                                    <p className="mt-1 text-sm text-red-600">{rescheduleValidationErrors.time}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={cancelReschedule}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => saveReschedule(reschedulingId)}
                                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Confirm Reschedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;