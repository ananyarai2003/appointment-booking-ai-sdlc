import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('application loads successfully', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Verify the page title
    await expect(page).toHaveTitle('Vite + React');

    // Verify the main heading is present
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/appointments list/i);

    // Verify the "Add New Appointment" button is present and visible
    const addButton = page.getByRole('link', { name: /add new appointment/i });
    await expect(addButton).toBeVisible();

    // Verify the appointments table is present
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verify that either appointments are shown or the "No appointments available" message
    const noAppointmentsMessage = page.locator('text=No appointments available');
    const appointmentRows = page.locator('tbody tr');

    // At least one should be visible (either the message or appointment rows)
    const messageVisible = await noAppointmentsMessage.isVisible().catch(() => false);
    const rowsCount = await appointmentRows.count();

    expect(messageVisible || rowsCount > 0).toBeTruthy();
  });

  test('navigation to add appointment form works', async ({ page }) => {
    await page.goto('/');

    // Click the "Add New Appointment" button
    const addButton = page.getByRole('link', { name: /add new appointment/i });
    await addButton.click();

    // Verify navigation to add appointment form
    await expect(page).toHaveURL(/.*\/add/);

    // Verify form elements are present
    const firstNameInput = page.locator('input[name="firstName"]');
    const lastNameInput = page.locator('input[name="lastName"]');
    const dateInput = page.locator('input[type="date"]');
    const timeInput = page.locator('input[type="time"]');

    await expect(firstNameInput).toBeVisible();
    await expect(lastNameInput).toBeVisible();
    await expect(dateInput).toBeVisible();
    await expect(timeInput).toBeVisible();
  });
});
