/**
 * Skill module - naming, paths, and building
 */

export { normalizeSkillName, titleFromKebab, isKebabCase } from './naming.js';
export {
  skillDirectory,
  skillFilePath,
  skillstashSkillPath,
  loadSkillstashSkill,
  composePrompt,
} from './paths.js';
export { buildSkillMarkdown, type SkillMarkdownOptions } from './builder.js';
