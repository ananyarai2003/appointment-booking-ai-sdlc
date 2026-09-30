# Appointment Booking System

A React application for managing appointments with stable IDs, conflict prevention, centralized validation, and explicit rescheduling. This project is frontend-only and uses localStorage for data persistence.

## MVP Features

This implementation includes the following approved enhancements:

- **Stable Appointment IDs (SAB-1):** All appointments receive unique, stable IDs using `crypto.randomUUID()` with fallback support. Legacy appointments without IDs are automatically migrated on first load.
- **Reliable Persistence (SAB-2):** Centralized state management through React hooks prevents infinite render loops and handles localStorage errors gracefully.
- **Explicit Rescheduling (SAB-3):** Dedicated reschedule workflow for changing appointment date/time, separate from editing personal information.
- **Double-Booking Prevention (SAB-4):** Centralized conflict detection prevents scheduling multiple appointments at the same date and time.
- **Centralized Validation (SAB-5):** Single source of truth for field validation with clear, field-level error messages for required fields and format validation.
- **Automated Testing (SAB-7):** Comprehensive Playwright E2E test suite with 23 tests covering CRUD operations, validation, conflicts, and rescheduling.

**Note:** Provider Availability Management (SAB-6) is designated as Phase 2 and is not part of the current MVP.

## Core Functionality

- **Add Appointment:** Create new appointments with first name, last name, date, time, and notes
- **View Appointments:** Display all appointments in a table format with filtering
- **Edit Appointment:** Modify client information (first name, last name, notes only)
- **Reschedule Appointment:** Change appointment date and time through dedicated workflow
- **Delete Appointment:** Remove appointments from the system
- **Filter by Date:** View appointments for a specific date
- **Persistent Storage:** All data saved in browser localStorage with automatic legacy migration
- **Conflict Prevention:** Prevent double-booking at the same date/time
- **Field Validation:** Required field validation with clear error messages

## Architecture

### Technology Stack
- **React 19.1.0** with functional components and hooks
- **Vite 7.0.0** for fast development and optimized builds
- **React Router DOM 7.6.3** for client-side routing
- **Tailwind CSS 4.1.11** for responsive styling
- **Playwright 1.63.0** for end-to-end testing
- **localStorage** for frontend-only data persistence

### Project Structure

```
appointment-booking-system/
├── src/
│   ├── domain/
│   │   └── appointments/
│   │       ├── ids.js              # Stable ID generation
│   │       ├── validation.js        # Centralized validation logic
│   │       └── conflicts.js         # Conflict detection logic
│   ├── state/
│   │   └── useAppointments.js      # Centralized state management hook
│   ├── storage/
│   │   └── appointmentsStorage.js  # localStorage abstraction layer
│   ├── App.jsx                     # Main app with routing
│   ├── Home.jsx                    # Appointments list and management
│   ├── AddBook.jsx                 # New appointment form
│   └── Navbar.jsx                  # Navigation component
├── tests/
│   └── e2e/
│       ├── smoke.spec.js           # Basic smoke tests
│       ├── appointments.spec.js     # Appointment management tests
│       └── reschedule.spec.js      # Rescheduling workflow tests
├── playwright.config.js            # Playwright configuration
└── package.json
```

### Architectural Layers

**Domain Layer** (`src/domain/`): Business logic for IDs, validation, and conflict detection

**State Layer** (`src/state/`): React hooks for centralized state management

**Storage Layer** (`src/storage/`): localStorage operations and legacy migration

**UI Layer** (`src/`): React components for user interface

## Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd appointment-booking-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Usage

### Development

Start the development server:
```bash
npm run dev
```
Open your browser and visit `http://localhost:5173`

### Linting

Run ESLint to check code quality:
```bash
npm run lint
```

### Build

Create a production build:
```bash
npm run build
```

### Testing

Run the end-to-end test suite:
```bash
npm run test:e2e
```

View the test report:
```bash
npm run test:e2e:report
```

## Testing

The application includes 23 comprehensive Playwright E2E tests:

- **Smoke tests (2):** Basic application loading and navigation
- **Appointment management tests (11):** CRUD operations, validation, persistence, filtering
- **Rescheduling tests (10):** Reschedule workflow, separation from edit, conflict prevention

Test coverage includes:
- Creating valid appointments
- Required field validation (firstName, lastName, date, time)
- Double-booking prevention
- Self-conflict exclusion during updates
- Persistence after page reload
- Date filtering
- Edit/reschedule workflow separation
- Reschedule with validation and conflict detection

## Notes

- **Frontend-only:** No backend, database, or authentication required
- **Browser storage:** All data persists in localStorage
- **Legacy migration:** Appointments without IDs are automatically migrated
- **Separation of concerns:** Edit changes personal info only; Reschedule changes date/time only
- **Phase 2:** Provider availability management is not included in this MVP

## License

This project is open source and free to use.
