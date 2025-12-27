/**
 * Validation module - skill validation utilities
 */

export type {
  ValidationError,
  SkillFrontmatter,
  SkillValidation,
  ValidationConfig,
} from './types.js';

export { DEFAULT_VALIDATION_CONFIG } from './types.js';

export { extractFrontmatter, type FrontmatterResult } from './frontmatter.js';

export { isKebabCase, countLines, asNumber, asBoolean, asStringArray } from './rules.js';

export { validateSkill, findSkills, validateAllSkills, hasErrors } from './validator.js';

export {
  colors,
  summarizeResults,
  printResults,
  formatResultsPlain,
  type ValidationSummary,
} from './reporter.js';
