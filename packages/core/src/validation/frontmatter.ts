/**
 * Frontmatter extraction and parsing
 */

import type { SkillFrontmatter } from './types.js';

export type FrontmatterResult = {
  frontmatter: SkillFrontmatter | null;
  error: string | null;
};

/**
 * Extract and parse YAML frontmatter from SKILL.md content
 */
export function extractFrontmatter(content: string): FrontmatterResult {
  const frontmatterRegex = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      frontmatter: null,
      error: 'No YAML frontmatter found (must start with --- and end with ---)',
    };
  }

  try {
    const frontmatter = Bun.YAML.parse(match[1]) as SkillFrontmatter;
    return { frontmatter, error: null };
  } catch (err) {
    return {
      frontmatter: null,
      error: `Invalid YAML in frontmatter: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
