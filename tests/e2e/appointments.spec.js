import { test, expect } from '@playwright/test';

test.describe('Appointment Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should create a valid appointment', async ({ page }) => {
    await page.goto('/');

    // Click "Add New Appointment"
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await expect(page).toHaveURL(/.*\/add/);

    // Fill out the form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.fill('textarea[name="notes"]', 'Annual checkup');

    // Submit the form
    await page.getByRole('button', { name: /book appointment/i }).click();

    // Should navigate back to home
    await expect(page).toHaveURL('/');

    // Appointment should be visible
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=2026-12-15')).toBeVisible();
    await expect(page.locator('text=10:00')).toBeVisible();
  });

  test('should reject appointment with missing first name', async ({ page }) => {
    await page.goto('/add');

    // Fill only some fields, leave firstName empty
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');

    // Submit the form
    await page.getByRole('button', { name: /book appointment/i }).click();

    // Should stay on the form page
    await expect(page).toHaveURL(/.*\/add/);

    // Should show validation error
    await expect(page.locator('text=/first name is required/i')).toBeVisible();
  });

  test('should reject appointment with missing last name', async ({ page }) => {
    await page.goto('/add');

    // Fill only some fields, leave lastName empty
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');

    // Submit the form
    await page.getByRole('button', { name: /book appointment/i }).click();

    // Should stay on the form page
    await expect(page).toHaveURL(/.*\/add/);

    // Should show validation error
    await expect(page.locator('text=/last name is required/i')).toBeVisible();
  });

  test('should reject appointment with missing date', async ({ page }) => {
    await page.goto('/add');

    // Fill only some fields, leave date empty
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="time"]', '10:00');

    // Submit the form
    await page.getByRole('button', { name: /book appointment/i }).click();

    // Should stay on the form page
    await expect(page).toHaveURL(/.*\/add/);

    // Should show validation error
    await expect(page.locator('text=/date is required/i')).toBeVisible();
  });

  test('should reject appointment with missing time', async ({ page }) => {
    await page.goto('/add');

    // Fill only some fields, leave time empty
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');

    // Submit the form
    await page.getByRole('button', { name: /book appointment/i }).click();

    // Should stay on the form page
    await expect(page).toHaveURL(/.*\/add/);

    // Should show validation error
    await expect(page.locator('text=/time is required/i')).toBeVisible();
  });

  test('should prevent double-booking at same date and time', async ({ page }) => {
    await page.goto('/');

    // Create first appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    // Wait for navigation back to home
    await expect(page).toHaveURL('/');

    // Try to create second appointment at same date and time
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    // Should stay on form and show conflict error
    await expect(page).toHaveURL(/.*\/add/);
    await expect(page.locator('text=/already booked/i')).toBeVisible();
  });

  test('should allow appointments at different times on same date', async ({ page }) => {
    await page.goto('/');

    // Create first appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Create second appointment at different time on same date
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '14:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    // Should succeed and navigate to home
    await expect(page).toHaveURL('/');

    // Both appointments should be visible
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });

  test('should allow editing an appointment without self-conflict', async ({ page }) => {
    await page.goto('/');

    // Create an appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Click edit on the appointment
    await page.getByRole('button', { name: /edit/i }).first().click();

    // Change only the notes (keep same date and time)
    const notesTextarea = page.locator('textarea[name="notes"]').first();
    await notesTextarea.fill('Updated notes');

    // Save the edit
    await page.getByRole('button', { name: /save/i }).first().click();

    // Should remain on home page with no conflict error
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should persist appointments after page reload', async ({ page }) => {
    await page.goto('/');

    // Create an appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.locator('text=John Doe')).toBeVisible();

    // Reload the page
    await page.reload();

    // Appointment should still be visible
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=2026-12-15')).toBeVisible();
    await expect(page.locator('text=10:00')).toBeVisible();
  });

  test('should delete an appointment', async ({ page }) => {
    await page.goto('/');

    // Create an appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');
    await expect(page.locator('text=John Doe')).toBeVisible();

    // Delete the appointment
    await page.getByRole('button', { name: /delete/i }).first().click();

    // Appointment should no longer be visible
    await expect(page.locator('text=John Doe')).not.toBeVisible();
    await expect(page.locator('text=No appointments available')).toBeVisible();
  });

  test('should filter appointments by date', async ({ page }) => {
    await page.goto('/');

    // Create two appointments on different dates
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="date"]', '2026-12-20');
    await page.fill('input[name="time"]', '14:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Both appointments should be visible
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();

    // Filter by first date
    await page.fill('input[id="filterDate"]', '2026-12-15');

    // Only first appointment should be visible
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).not.toBeVisible();

    // Clear filter
    await page.getByRole('button', { name: /clear filter/i }).click();

    // Both appointments should be visible again
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Jane Smith')).toBeVisible();
  });
});
