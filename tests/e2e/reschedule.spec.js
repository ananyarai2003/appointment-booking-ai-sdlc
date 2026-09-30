import { test, expect } from '@playwright/test';

test.describe('Appointment Rescheduling (SAB-3)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should open the reschedule modal', async ({ page }) => {
    await page.goto('/');

    // Create an appointment first
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Click Reschedule button
    await page.getByRole('button', { name: /reschedule/i }).first().click();

    // Reschedule modal should be visible
    await expect(page.locator('text=Reschedule Appointment')).toBeVisible();
    await expect(page.locator('input[id="rescheduleDate"]')).toBeVisible();
    await expect(page.locator('input[id="rescheduleTime"]')).toBeVisible();
  });

  test('should successfully reschedule an appointment to a free date/time', async ({ page }) => {
    await page.goto('/');

    // Create an appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.fill('textarea[name="notes"]', 'Original notes');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Get the original appointment ID from localStorage
    const originalId = await page.evaluate(() => {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      return appointments[0]?.id;
    });

    // Click Reschedule
    await page.getByRole('button', { name: /reschedule/i }).first().click();

    // Change date and time
    await page.fill('input[id="rescheduleDate"]', '2026-12-20');
    await page.fill('input[id="rescheduleTime"]', '14:30');

    // Confirm reschedule
    await page.getByRole('button', { name: /confirm reschedule/i }).click();

    // Modal should close
    await expect(page.locator('text=Reschedule Appointment')).not.toBeVisible();

    // Verify new date and time are displayed
    await expect(page.locator('text=2026-12-20')).toBeVisible();
    await expect(page.locator('text=14:30')).toBeVisible();

    // Verify old date/time are gone
    await expect(page.locator('text=2026-12-15')).not.toBeVisible();
    await expect(page.locator('text=10:00')).not.toBeVisible();

    // Verify appointment ID remains unchanged
    const newId = await page.evaluate(() => {
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      return appointments[0]?.id;
    });
    expect(newId).toBe(originalId);
  });

  test('should preserve first name, last name, and notes when rescheduling', async ({ page }) => {
    await page.goto('/');

    // Create an appointment with all fields
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.fill('textarea[name="notes"]', 'Important client meeting');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Reschedule
    await page.getByRole('button', { name: /reschedule/i }).first().click();
    await page.fill('input[id="rescheduleDate"]', '2026-12-16');
    await page.fill('input[id="rescheduleTime"]', '15:00');
    await page.getByRole('button', { name: /confirm reschedule/i }).click();

    // Verify name and notes remain unchanged
    await expect(page.locator('text=Jane Smith')).toBeVisible();
    await expect(page.locator('text=Important client meeting')).toBeVisible();

    // Verify only date/time changed
    await expect(page.locator('text=2026-12-16')).toBeVisible();
    await expect(page.locator('text=15:00')).toBeVisible();
  });

  test('should reject reschedule to an occupied date/time', async ({ page }) => {
    await page.goto('/');

    // Create first appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Create second appointment at different time
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '14:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Try to reschedule second appointment to first appointment's time
    const rescheduleButtons = page.getByRole('button', { name: /reschedule/i });
    await rescheduleButtons.nth(1).click();

    await page.fill('input[id="rescheduleDate"]', '2026-12-15');
    await page.fill('input[id="rescheduleTime"]', '10:00');
    await page.getByRole('button', { name: /confirm reschedule/i }).click();

    // Should show conflict error
    await expect(page.locator('text=/already booked/i')).toBeVisible();

    // Modal should still be open
    await expect(page.locator('text=Reschedule Appointment')).toBeVisible();

    // Cancel the reschedule
    await page.getByRole('button', { name: /cancel/i }).click();

    // Verify second appointment still has original time
    const janeRow = page.locator('tr', { has: page.locator('text=Jane Smith') });
    await expect(janeRow.locator('text=14:00')).toBeVisible();
  });

  test('should allow rescheduling to the same date/time (no self-conflict)', async ({ page }) => {
    await page.goto('/');

    // Create an appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Reschedule to the same date/time
    await page.getByRole('button', { name: /reschedule/i }).first().click();
    await page.fill('input[id="rescheduleDate"]', '2026-12-15');
    await page.fill('input[id="rescheduleTime"]', '10:00');
    await page.getByRole('button', { name: /confirm reschedule/i }).click();

    // Should succeed (no self-conflict)
    await expect(page.locator('text=Reschedule Appointment')).not.toBeVisible();

    // Appointment should still exist with same date/time
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=2026-12-15')).toBeVisible();
    await expect(page.locator('text=10:00')).toBeVisible();
  });

  test('should reject reschedule with invalid date', async ({ page }) => {
    await page.goto('/');

    // Create an appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Try to reschedule with empty date
    await page.getByRole('button', { name: /reschedule/i }).first().click();
    await page.fill('input[id="rescheduleDate"]', '');
    await page.fill('input[id="rescheduleTime"]', '14:00');
    await page.getByRole('button', { name: /confirm reschedule/i }).click();

    // Should show validation error
    await expect(page.locator('text=/date is required/i')).toBeVisible();

    // Modal should still be open
    await expect(page.locator('text=Reschedule Appointment')).toBeVisible();
  });

  test('should reject reschedule with invalid time', async ({ page }) => {
    await page.goto('/');

    // Create an appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Try to reschedule with empty time
    await page.getByRole('button', { name: /reschedule/i }).first().click();
    await page.fill('input[id="rescheduleDate"]', '2026-12-20');
    await page.fill('input[id="rescheduleTime"]', '');
    await page.getByRole('button', { name: /confirm reschedule/i }).click();

    // Should show validation error
    await expect(page.locator('text=/time is required/i')).toBeVisible();

    // Modal should still be open
    await expect(page.locator('text=Reschedule Appointment')).toBeVisible();
  });

  test('should cancel rescheduling without making changes', async ({ page }) => {
    await page.goto('/');

    // Create an appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Open reschedule modal and change values
    await page.getByRole('button', { name: /reschedule/i }).first().click();
    await page.fill('input[id="rescheduleDate"]', '2026-12-20');
    await page.fill('input[id="rescheduleTime"]', '15:00');

    // Cancel instead of confirming
    await page.getByRole('button', { name: /cancel/i }).click();

    // Modal should close
    await expect(page.locator('text=Reschedule Appointment')).not.toBeVisible();

    // Original date/time should remain unchanged
    await expect(page.locator('text=2026-12-15')).toBeVisible();
    await expect(page.locator('text=10:00')).toBeVisible();

    // New date/time should not be present
    await expect(page.locator('text=2026-12-20')).not.toBeVisible();
    await expect(page.locator('text=15:00')).not.toBeVisible();
  });

  test('should persist rescheduled appointment after page reload', async ({ page }) => {
    await page.goto('/');

    // Create and reschedule an appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: /reschedule/i }).first().click();
    await page.fill('input[id="rescheduleDate"]', '2026-12-25');
    await page.fill('input[id="rescheduleTime"]', '16:00');
    await page.getByRole('button', { name: /confirm reschedule/i }).click();

    // Verify reschedule succeeded
    await expect(page.locator('text=2026-12-25')).toBeVisible();
    await expect(page.locator('text=16:00')).toBeVisible();

    // Reload the page
    await page.reload();

    // Rescheduled date/time should persist
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=2026-12-25')).toBeVisible();
    await expect(page.locator('text=16:00')).toBeVisible();
  });

  test('should not allow changing date/time through normal edit flow', async ({ page }) => {
    await page.goto('/');

    // Create an appointment
    await page.getByRole('link', { name: /add new appointment/i }).click();
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="date"]', '2026-12-15');
    await page.fill('input[name="time"]', '10:00');
    await page.fill('textarea[name="notes"]', 'Original notes');
    await page.getByRole('button', { name: /book appointment/i }).click();

    await expect(page).toHaveURL('/');

    // Click Edit button
    await page.getByRole('button', { name: /^edit$/i }).first().click();

    // Verify date and time fields are NOT editable (shown as read-only text)
    const dateInput = page.locator('input[type="date"][name="date"]');
    const timeInput = page.locator('input[type="time"][name="time"]');

    // These inputs should not exist in edit mode
    await expect(dateInput).not.toBeVisible();
    await expect(timeInput).not.toBeVisible();

    // Instead, date and time should be displayed as read-only text
    const editRow = page.locator('tr').filter({ has: page.locator('input[name="firstName"]') });
    await expect(editRow.locator('text=2026-12-15')).toBeVisible();
    await expect(editRow.locator('text=10:00')).toBeVisible();
    await expect(editRow.locator('text=/use reschedule to change/i').first()).toBeVisible();

    // Verify firstName, lastName, and notes ARE editable
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('textarea[name="notes"]')).toBeVisible();

    // Make changes to firstName and notes
    await page.fill('input[name="firstName"]', 'Jonathan');
    await page.fill('textarea[name="notes"]', 'Updated notes');

    // Save edit
    await page.getByRole('button', { name: /save/i }).first().click();

    // Verify firstName and notes changed
    await expect(page.locator('text=Jonathan Doe')).toBeVisible();
    await expect(page.locator('text=Updated notes')).toBeVisible();

    // Verify date and time remained unchanged
    await expect(page.locator('text=2026-12-15')).toBeVisible();
    await expect(page.locator('text=10:00')).toBeVisible();
  });
});
