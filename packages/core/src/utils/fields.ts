/**
 * Text field extraction utilities
 */

/**
 * Extract a field value from markdown body using ### headings
 */
export function extractField(body: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`###\\s+${escaped}\\s*\\n+([\\s\\S]*?)(?=\\n###\\s|$)`, 'i');
  const match = body.match(pattern);
  if (!match) {
    return null;
  }
  const value = match[1].trim();
  return value === '' ? null : value;
}

/**
 * Sanitize multiline text by trimming lines and removing empty ones
 */
export function sanitizeLines(value: string): string {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Extract skill name from issue title format "skill: name"
 */
export function issueTitleToName(title: string): string | null {
  const match = title.match(/skill:\s*(.+)/i);
  return match ? match[1].trim() : null;
}
