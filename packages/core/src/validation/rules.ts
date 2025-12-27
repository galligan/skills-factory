/**
 * Validation rules and helpers
 */

/**
 * Check if a name follows kebab-case convention
 */
export function isKebabCase(name: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
}

/**
 * Count lines in a string
 */
export function countLines(content: string): number {
  return content.split('\n').length;
}

/**
 * Safely cast unknown to number with fallback
 */
export function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Safely cast unknown to boolean with fallback
 */
export function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Safely cast unknown to string array with fallback
 */
export function asStringArray(value: unknown, fallback: string[]): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : fallback;
}
