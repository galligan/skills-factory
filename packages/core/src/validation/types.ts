/**
 * Validation type definitions
 */

export type ValidationError = {
  file: string;
  message: string;
  severity: 'error' | 'warning';
};

export type SkillFrontmatter = {
  name?: string;
  description?: string;
  [key: string]: unknown;
};

export type SkillValidation = {
  skillPath: string;
  skillName: string;
  errors: ValidationError[];
  warnings: ValidationError[];
};

export type ValidationConfig = {
  skillsDir: string;
  maxLines: number;
  requiredFiles: string[];
  requiredFrontmatter: string[];
  enforceKebabCase: boolean;
};

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  skillsDir: 'skills',
  maxLines: 500,
  requiredFiles: ['SKILL.md'],
  requiredFrontmatter: ['name', 'description'],
  enforceKebabCase: true,
};
