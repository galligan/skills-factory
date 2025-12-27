/**
 * Skill validation logic
 */

import { basename, join } from 'node:path';
import { Glob } from 'bun';
import type { SkillValidation, ValidationConfig, ValidationError } from './types.js';
import { extractFrontmatter } from './frontmatter.js';
import { countLines, isKebabCase } from './rules.js';

/**
 * Validate a single skill directory
 */
export async function validateSkill(
  skillPath: string,
  config: ValidationConfig,
): Promise<SkillValidation> {
  const skillName = basename(skillPath);
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Check kebab-case naming
  if (config.enforceKebabCase && !isKebabCase(skillName)) {
    errors.push({
      file: skillPath,
      message: `Skill directory name '${skillName}' must be kebab-case (lowercase with hyphens)`,
      severity: 'error',
    });
  }

  // Check for SKILL.md
  const skillMdPath = join(skillPath, 'SKILL.md');
  const skillMdFile = Bun.file(skillMdPath);
  const skillMdExists = await skillMdFile.exists();

  // Check required files
  for (const requiredFile of config.requiredFiles) {
    const requiredPath = join(skillPath, requiredFile);
    const file = Bun.file(requiredPath);
    if (!(await file.exists())) {
      errors.push({
        file: skillPath,
        message: `Missing required file: ${requiredFile}`,
        severity: 'error',
      });
    }
  }

  // If SKILL.md exists, validate its contents
  if (skillMdExists) {
    try {
      const content = await skillMdFile.text();

      // Check line count
      const lineCount = countLines(content);
      if (lineCount > config.maxLines) {
        errors.push({
          file: skillMdPath,
          message: `SKILL.md has ${lineCount} lines (max: ${config.maxLines})`,
          severity: 'error',
        });
      }

      // Extract and validate frontmatter
      const { frontmatter, error } = extractFrontmatter(content);

      if (error) {
        errors.push({
          file: skillMdPath,
          message: error,
          severity: 'error',
        });
      } else if (frontmatter) {
        // Check required fields
        for (const field of config.requiredFrontmatter) {
          if (!frontmatter[field] || String(frontmatter[field]).trim() === '') {
            errors.push({
              file: skillMdPath,
              message: `Missing or empty required frontmatter field: '${field}'`,
              severity: 'error',
            });
          }
        }

        // Check if name matches folder name
        if (frontmatter.name && frontmatter.name !== skillName) {
          errors.push({
            file: skillMdPath,
            message: `Frontmatter 'name' field ('${frontmatter.name}') must match directory name ('${skillName}')`,
            severity: 'error',
          });
        }
      }
    } catch (err) {
      errors.push({
        file: skillMdPath,
        message: `Failed to read or parse SKILL.md: ${err instanceof Error ? err.message : String(err)}`,
        severity: 'error',
      });
    }
  }

  return { skillPath, skillName, errors, warnings };
}

/**
 * Find all skill directories using Bun.glob
 */
export async function findSkills(skillsDir: string, cwd?: string): Promise<string[]> {
  const basePath = cwd ?? process.cwd();
  const skillsPath = join(basePath, skillsDir);

  // Check if skills directory exists
  const skillsDirFile = Bun.file(skillsPath);
  if (!(await skillsDirFile.exists())) {
    return [];
  }

  // Use Bun.glob to find all SKILL.md files
  const glob = new Glob('*/SKILL.md');
  const skills: string[] = [];

  for await (const match of glob.scan({ cwd: skillsPath })) {
    // Extract directory name from path like "skill-name/SKILL.md"
    const skillName = match.split('/')[0];
    if (!skillName.startsWith('.')) {
      skills.push(join(skillsPath, skillName));
    }
  }

  return skills.sort();
}

/**
 * Validate all skills in a directory
 */
export async function validateAllSkills(
  config: ValidationConfig,
  cwd?: string,
): Promise<SkillValidation[]> {
  const skillPaths = await findSkills(config.skillsDir, cwd);
  return Promise.all(skillPaths.map((path) => validateSkill(path, config)));
}

/**
 * Check if any validation results have errors
 */
export function hasErrors(results: SkillValidation[]): boolean {
  return results.some((r) => r.errors.length > 0);
}
