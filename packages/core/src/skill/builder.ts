/**
 * Skill markdown builder
 */

import { titleFromKebab } from './naming.js';

export type SkillMarkdownOptions = {
  name: string;
  description: string;
  sources?: string | null;
  spec?: string | null;
};

/**
 * Build a SKILL.md file content from options
 */
export function buildSkillMarkdown(options: SkillMarkdownOptions): string {
  const title = titleFromKebab(options.name);
  const lines: string[] = [
    '---',
    `name: ${options.name}`,
    `description: ${options.description}`,
    '---',
    '',
    `# ${title}`,
    '',
    options.description,
    '',
    '## When this skill activates',
    '',
    `- When a user asks for ${options.name} by name`,
    `- When a request aligns with: ${options.description}`,
    '',
    '## What this skill does',
    '',
    `- Provides guidance and workflows related to ${options.description}`,
  ];

  if (options.spec) {
    lines.push('', '## Additional spec', '', options.spec.trim());
  }

  if (options.sources) {
    lines.push('', '## Sources', '', options.sources.trim());
  }

  lines.push('');
  return lines.join('\n');
}
