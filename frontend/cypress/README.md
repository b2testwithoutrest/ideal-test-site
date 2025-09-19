# Cypress E2E Tests

This directory contains comprehensive end-to-end tests for the Ideal Test Site React frontend.

## Prerequisites

**Important**: The backend must be running for tests to pass. Start the backend with:
```bash
cd backend && npm start
```

The tests are configured to run against the frontend at `http://localhost:3000/ideal-test-site`.

## Running Tests

### Interactive Mode (Cypress Test Runner)
```bash
npm run cypress
```

### Headless Mode (CI/Terminal)
```bash
npm run cy:run
```

## Test Files

- **`registration.cy.js`**: Tests user registration with positive and negative scenarios
- **`login.cy.js`**: Tests login with correct/incorrect credentials and validation
- **`dashboard.cy.js`**: Tests creating/deleting entries and handling invalid submissions
- **`wall.cy.js`**: Tests loading and viewing public entries
- **`admin.cy.js`**: Tests admin features and access control for non-admin users
- **`darkmode.cy.js`**: Tests dark mode toggle functionality and persistence
- **`logout.cy.js`**: Tests logout functionality clears session and UI state

## Features

- **Randomized usernames**: Tests use unique usernames to avoid collisions
- **Comprehensive coverage**: Both positive and negative test cases
- **Real backend integration**: Tests work against actual API endpoints
- **Custom commands**: Helper functions for common operations (login, register, etc.)
- **Proper cleanup**: Each test starts with clean state

## Test Data

- Default admin user: `admin` / `adminpass`
- Test users are created with randomized usernames like `testuser_timestamp_random`
- All user data is temporary and created/cleaned up during test runs

## Configuration

The Cypress configuration is in `cypress.config.js`:
- Base URL: `http://localhost:3000/ideal-test-site`
- Viewport: 1280x720
- Timeouts: 10 seconds for commands and requests
- Video recording: Disabled (can be enabled for debugging)