/**
 * @skillstash/core
 *
 * Core utilities for Skillstash repositories.
 * Provides config loading, validation, skill management, and workflow helpers.
 */

// Config
export {
  loadConfig,
  type StashConfig,
  type DefaultsConfig,
  type LabelsConfig,
  type ValidationConfig,
  type AgentName,
  type WorkflowRole,
  type AgentsConfig,
  type WorkflowStep,
} from './config/index.js';

// Validation
export {
  validateAllSkills,
  validateSkill,
  findSkills,
  hasErrors,
  extractFrontmatter,
  isKebabCase,
  countLines,
  printResults,
  formatResultsPlain,
  summarizeResults,
  colors,
  DEFAULT_VALIDATION_CONFIG,
  type ValidationError,
  type SkillValidation,
  type SkillFrontmatter,
  type FrontmatterResult,
  type ValidationSummary,
} from './validation/index.js';

// Skill utilities
export {
  buildSkillMarkdown,
  normalizeSkillName,
  titleFromKebab,
  skillDirectory,
  skillFilePath,
} from './skill/index.js';

// Workflow helpers
export {
  resolveAgent,
  resolveWorkflow,
  resolveReviewMode,
  branchName,
  type BranchAction,
} from './workflow/index.js';

// GitHub utilities
export {
  extractField,
  sanitizeLines,
  issueTitleToName,
  type IssueEvent,
  type PullRequestEvent,
  type AutomationMode,
} from './github/index.js';
