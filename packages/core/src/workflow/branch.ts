/**
 * Branch naming utilities
 */

export type BranchAction = 'add' | 'update' | 'remove';

/**
 * Generate a branch name for a skill action
 */
export function branchName(name: string, action: BranchAction = 'add'): string {
  return `skill/${action}-${name}`;
}
