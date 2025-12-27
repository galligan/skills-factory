/**
 * Skill path utilities
 */

import { join } from 'node:path';
import type { WorkflowRole } from '../config/types.js';

/**
 * Get the directory path for a skill
 */
export function skillDirectory(name: string, cwd: string = process.cwd()): string {
  return join(cwd, 'skills', name);
}

/**
 * Get the SKILL.md file path for a skill
 */
export function skillFilePath(name: string, cwd: string = process.cwd()): string {
  return join(skillDirectory(name, cwd), 'SKILL.md');
}

const SKILLSTASH_ROLE_SKILL = {
  research: 'skillstash-research',
  author: 'skillstash-author',
  review: 'skillstash-review',
} as const;

/**
 * Get the path to a skillstash internal skill
 */
export function skillstashSkillPath(role: WorkflowRole, cwd: string = process.cwd()): string {
  const skillName = SKILLSTASH_ROLE_SKILL[role];
  return join(cwd, '.agents', 'skills', skillName, 'SKILL.md');
}

/**
 * Load a skillstash internal skill content
 */
export async function loadSkillstashSkill(
  role: WorkflowRole,
  cwd: string = process.cwd(),
): Promise<string> {
  const path = skillstashSkillPath(role, cwd);
  return Bun.file(path).text();
}

/**
 * Compose a prompt from a skill and optional context blocks
 */
export async function composePrompt(
  role: WorkflowRole,
  contextBlocks: string[] = [],
  cwd: string = process.cwd(),
): Promise<string> {
  const skill = await loadSkillstashSkill(role, cwd);
  const parts = [skill.trim(), ...contextBlocks.map((block) => block.trim()).filter(Boolean)];
  return parts.join('\n\n');
}
