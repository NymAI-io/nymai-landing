// Utility functions for Extension ID validation and management

/**
 * Validates if a string matches Chrome extension ID format
 * Chrome extension IDs are 32-character lowercase alphanumeric strings
 * @param id - The extension ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidExtensionId(id: string | null): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // Chrome extension IDs are exactly 32 lowercase alphanumeric characters
  return /^[a-z0-9]{32}$/.test(id);
}

/**
 * Sanitizes an extension ID by removing invalid characters
 * @param id - The extension ID to sanitize
 * @returns Sanitized extension ID or null if invalid
 */
export function sanitizeExtensionId(id: string | null): string | null {
  if (!id || typeof id !== 'string') {
    return null;
  }
  // Remove any non-alphanumeric characters and convert to lowercase
  const sanitized = id.replace(/[^a-z0-9]/gi, '').toLowerCase();
  // Return only if it's exactly 32 characters
  return sanitized.length === 32 ? sanitized : null;
}

/**
 * Gets and validates extension ID from sessionStorage
 * @returns Valid extension ID or null
 */
export function getExtensionIdFromStorage(): string | null {
  const id = sessionStorage.getItem('nymAI_dev_extension_id');
  return isValidExtensionId(id) ? id : null;
}

/**
 * Saves extension ID to sessionStorage after validation
 * @param id - The extension ID to save
 * @returns true if saved successfully, false if invalid
 */
export function saveExtensionIdToStorage(id: string | null): boolean {
  if (!isValidExtensionId(id)) {
    console.warn('NymAI: Invalid extension ID format, not saving to storage');
    return false;
  }
  sessionStorage.setItem('nymAI_dev_extension_id', id);
  return true;
}

/**
 * Clears extension ID from sessionStorage
 */
export function clearExtensionIdFromStorage(): void {
  sessionStorage.removeItem('nymAI_dev_extension_id');
}

