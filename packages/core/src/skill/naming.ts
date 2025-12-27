/**
 * Skill naming utilities
 */

/**
 * Normalize a skill name to kebab-case
 */
export function normalizeSkillName(raw: string): { name: string; changed: boolean } {
  const trimmed = raw.trim();
  const normalized = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return { name: normalized, changed: normalized !== trimmed };
}

/**
 * Convert kebab-case to Title Case
 */
export function titleFromKebab(name: string): string {
  return name
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Check if a name is valid kebab-case
 */
export function isKebabCase(name: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
}
