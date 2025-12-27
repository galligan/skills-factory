/**
 * Validation result reporting
 */

import type { SkillValidation, ValidationConfig } from './types.js';

/**
 * ANSI color codes for terminal output
 */
export const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
} as const;

export type ValidationSummary = {
  skillsChecked: number;
  totalErrors: number;
  totalWarnings: number;
  passed: boolean;
};

/**
 * Calculate summary statistics from validation results
 */
export function summarizeResults(results: SkillValidation[]): ValidationSummary {
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  return {
    skillsChecked: results.length,
    totalErrors,
    totalWarnings,
    passed: totalErrors === 0,
  };
}

/**
 * Format and print validation results to console
 */
export function printResults(results: SkillValidation[], config: ValidationConfig): void {
  const summary = summarizeResults(results);

  console.log(`\n${colors.bold}Skills Validation Report${colors.reset}\n`);

  if (results.length === 0) {
    console.log(`${colors.gray}No skills found in ${config.skillsDir}/${colors.reset}\n`);
    return;
  }

  // Print results for each skill
  for (const result of results) {
    const hasIssues = result.errors.length > 0 || result.warnings.length > 0;
    const statusIcon = hasIssues ? '✗' : '✓';
    const statusColor = hasIssues ? colors.red : colors.green;

    console.log(
      `${statusColor}${statusIcon}${colors.reset} ${colors.bold}${result.skillName}${colors.reset}`,
    );

    // Print errors
    for (const error of result.errors) {
      console.log(`  ${colors.red}ERROR${colors.reset} ${error.message}`);
      console.log(`  ${colors.gray}${error.file}${colors.reset}`);
    }

    // Print warnings
    for (const warning of result.warnings) {
      console.log(`  ${colors.yellow}WARN${colors.reset} ${warning.message}`);
      console.log(`  ${colors.gray}${warning.file}${colors.reset}`);
    }

    if (!hasIssues) {
      console.log(`  ${colors.gray}All checks passed${colors.reset}`);
    }

    console.log('');
  }

  // Print summary
  console.log(`${colors.bold}Summary${colors.reset}`);
  console.log(`  Skills checked: ${summary.skillsChecked}`);
  console.log(
    `  Errors: ${summary.totalErrors > 0 ? colors.red : colors.green}${summary.totalErrors}${colors.reset}`,
  );
  console.log(
    `  Warnings: ${summary.totalWarnings > 0 ? colors.yellow : colors.green}${summary.totalWarnings}${colors.reset}`,
  );
  console.log('');
}

/**
 * Format results as a simple string (for non-TTY output)
 */
export function formatResultsPlain(results: SkillValidation[]): string {
  const lines: string[] = [];
  const summary = summarizeResults(results);

  lines.push('Skills Validation Report');
  lines.push('');

  if (results.length === 0) {
    lines.push('No skills found');
    return lines.join('\n');
  }

  for (const result of results) {
    const status = result.errors.length > 0 ? 'FAIL' : 'PASS';
    lines.push(`[${status}] ${result.skillName}`);

    for (const error of result.errors) {
      lines.push(`  ERROR: ${error.message}`);
    }

    for (const warning of result.warnings) {
      lines.push(`  WARN: ${warning.message}`);
    }
  }

  lines.push('');
  lines.push(`Skills checked: ${summary.skillsChecked}`);
  lines.push(`Errors: ${summary.totalErrors}`);
  lines.push(`Warnings: ${summary.totalWarnings}`);

  return lines.join('\n');
}
