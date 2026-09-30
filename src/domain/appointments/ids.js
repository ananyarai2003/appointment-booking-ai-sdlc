/**
 * Stable unique appointment ID generation.
 *
 * Prefers crypto.randomUUID() with a safe fallback for environments
 * where it may not be available.
 */

/**
 * Generates a unique appointment ID.
 *
 * Uses crypto.randomUUID() if available, otherwise falls back to
 * a timestamp-based UUID v4-like implementation.
 *
 * @returns {string} A unique appointment ID
 */
export function generateAppointmentId() {
  // Prefer crypto.randomUUID() where available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: Generate a UUID v4-like ID using timestamp + random values
  return fallbackUUID();
}

/**
 * Fallback UUID generation for environments without crypto.randomUUID().
 * Generates a UUID v4-like string.
 *
 * @returns {string} A UUID v4-like identifier
 */
function fallbackUUID() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);

  // Format as UUID-like string: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const hex = (timestamp + randomPart + randomPart2 + '0'.repeat(32)).substring(0, 32);

  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    '4' + hex.substring(13, 16), // Version 4
    ((parseInt(hex.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hex.substring(17, 20), // Variant
    hex.substring(20, 32)
  ].join('-');
}
