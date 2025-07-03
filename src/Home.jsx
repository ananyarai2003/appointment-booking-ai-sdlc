import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [appointments, setAppointments] = useState([]);
    const [filterDate, setFilterDate] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        date: '',
        time: '',
        notes: ''
    });


    useEffect(() => {
        const storedAppointments = JSON.parse(localStorage.getItem("appointments")) || [];
        setAppointments(storedAppointments);
    }, [appointments]);


    const filteredAppointments = appointments.filter(app => {
        const matchesDate = filterDate ? app.date === filterDate : true;
        return matchesDate;
    });


    const deleteAppointment = (index) => {
        const updatedAppointments = appointments.filter((_, i) => i !== index);
        setAppointments(updatedAppointments);
        localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    };


    const startEditing = (index) => {
        setEditingId(index);
        setEditForm(appointments[index]);
    };


    const saveEdit = (index) => {
        const updatedAppointments = [...appointments];
        updatedAppointments[index] = editForm;
        setAppointments(updatedAppointments);
        localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
        setEditingId(null);
    };


    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const styleTh = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Appointments List</h1>
                <Link
                    to="/add"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                    Add New Appointment
                </Link>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full p-2 border rounded-md"
                    />
                </div>

            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">

                        <tr>
                            <th className={styleTh}>name</th>
                            <th className={styleTh}>date</th>
                            <th className={styleTh}>time</th>
                            <th className={styleTh}>notes</th>
                            <th className={styleTh}>actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No appointments available</td>
                            </tr>
                        ) : (
                            filteredAppointments.map((appointment, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    {editingId === index ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={editForm.firstName}
                                                    onChange={handleEditChange}
                                                    className="w-full p-1 border rounded"
                                                />
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={editForm.lastName}
                                                    onChange={handleEditChange}
                                                    className="w-full p-1 border rounded mt-1"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="date"
                                                    name="date"
                                                    value={editForm.date}
                                                    onChange={handleEditChange}
                                                    className="w-full p-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="time"
                                                    name="time"
                                                    value={editForm.time}
                                                    onChange={handleEditChange}
                                                    className="w-full p-1 border rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <textarea
                                                    name="notes"
                                                    value={editForm.notes}
                                                    onChange={handleEditChange}
                                                    className="w-full p-1 border rounded"
                                                    rows="2"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => saveEdit(index)}
                                                    className="text-green-600 hover:text-green-900 mr-2"
                                                >
                                                    save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    cancel
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4">{appointment.firstName} {appointment.lastName}</td>
                                            <td className="px-6 py-4">{appointment.date}</td>
                                            <td className="px-6 py-4">{appointment.time}</td>
                                            <td className="px-6 py-4 max-w-xs truncate">{appointment.notes}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => startEditing(index)}
                                                    className="text-blue-600 hover:text-blue-900 mr-2"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteAppointment(index)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Home;