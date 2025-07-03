
# Appointment Booking System Interface

A simple React application for managing appointments (bookings) with a clean, user-friendly interface styled using Tailwind CSS. This project is frontend-only and uses localStorage for data persistence.

## Features

- **Add Appointment:** Users can add new appointments with client name, date, time, and notes.
- **View Appointments:** All appointments are displayed in a table format.
- **Edit Appointment:** Users can edit any existing appointment directly from the list.
- **Delete Appointment:** Users can delete any appointment.
- **Filter by Date:** Appointments can be filtered by date.
- **Persistent Storage:** All data is saved in the browser's localStorage, so appointments remain after page reloads.
- **Responsive Design:** The interface is responsive and styled with Tailwind CSS.

## Technologies Used
- React
- React Router DOM
- Tailwind CSS
- localStorage (for data persistence)

## How to Run
1. **Clone the repository:**
   ```
   git clone <your-repo-url>
   ```
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Start the development server:**
   ```
   npm run dev
   ```
4. **Open your browser:**
   Visit `http://localhost:5173` (or the port shown in your terminal).

## Project Structure
- `src/Home.jsx` — Main page for listing, editing, deleting, and filtering appointments.
- `src/AddBook.jsx` — Page for adding a new appointment.
- `src/Navbar.jsx` — Navigation bar.
- `src/App.jsx` — Main app component with routing.
- `public/` — Static assets.

## Notes
- This project is frontend-only. No backend or database is required.
- All logic and data storage are handled in the browser.
- You can use or modify this project as a template for similar booking or CRUD interfaces.

## Screenshots
_Add screenshots here if needed._

## License
This project is open source and free to use.
