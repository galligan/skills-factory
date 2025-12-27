/**
 * Shell utilities using Bun.$
 */

import { $ } from 'bun';

export type ShellResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
};

/**
 * Run a git command and return the output
 */
export async function git(...args: string[]): Promise<ShellResult> {
  const result = await $`git ${args}`.quiet().nothrow();
  return {
    stdout: result.stdout.toString().trim(),
    stderr: result.stderr.toString().trim(),
    exitCode: result.exitCode,
    success: result.exitCode === 0,
  };
}

/**
 * Run a gh CLI command and return the output
 */
export async function gh(...args: string[]): Promise<ShellResult> {
  const result = await $`gh ${args}`.quiet().nothrow();
  return {
    stdout: result.stdout.toString().trim(),
    stderr: result.stderr.toString().trim(),
    exitCode: result.exitCode,
    success: result.exitCode === 0,
  };
}

/**
 * Run a gh CLI command with a specific token
 */
export async function ghWithToken(token: string, ...args: string[]): Promise<ShellResult> {
  const result = await $`gh ${args}`.env({ GH_TOKEN: token }).quiet().nothrow();
  return {
    stdout: result.stdout.toString().trim(),
    stderr: result.stderr.toString().trim(),
    exitCode: result.exitCode,
    success: result.exitCode === 0,
  };
}

/**
 * Configure git user for commits
 */
export async function configureGitUser(name: string, email: string): Promise<void> {
  await $`git config user.name ${name}`.quiet();
  await $`git config user.email ${email}`.quiet();
}

/**
 * Stage, commit, and push changes
 */
export async function commitAndPush(
  files: string[],
  message: string,
  branch: string,
  remote: string = 'origin',
): Promise<ShellResult> {
  for (const file of files) {
    await $`git add ${file}`.quiet();
  }

  const commitResult = await $`git commit -m ${message}`.quiet().nothrow();
  if (commitResult.exitCode !== 0) {
    return {
      stdout: commitResult.stdout.toString().trim(),
      stderr: commitResult.stderr.toString().trim(),
      exitCode: commitResult.exitCode,
      success: false,
    };
  }

  const pushResult = await $`git push ${remote} HEAD:${branch}`.quiet().nothrow();
  return {
    stdout: pushResult.stdout.toString().trim(),
    stderr: pushResult.stderr.toString().trim(),
    exitCode: pushResult.exitCode,
    success: pushResult.exitCode === 0,
  };
}
