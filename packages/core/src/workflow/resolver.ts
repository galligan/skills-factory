/**
 * Workflow resolution utilities
 */

import type {
  AgentName,
  DefaultsConfig,
  StashConfig,
  WorkflowRole,
} from '../config/types.js';

/**
 * Resolve the agent to use for a given workflow role
 */
export function resolveAgent(
  config: StashConfig,
  role: WorkflowRole,
  override?: string,
): AgentName {
  const candidate = override ?? config.agents.roles[role] ?? 'default';
  if (candidate === 'default') {
    return config.agents.default;
  }
  return candidate === 'codex' || candidate === 'claude' ? candidate : config.agents.default;
}

/**
 * Resolve the complete workflow with agent assignments
 */
export function resolveWorkflow(
  config: StashConfig,
): Array<{ role: WorkflowRole; agent: AgentName }> {
  const base =
    config.workflow.length > 0
      ? config.workflow
      : (['research', 'author', 'review'] as WorkflowRole[]).map((role) => ({
          role,
          agent: config.agents.roles[role] ?? 'default',
        }));

  return base.map((step) => ({
    role: step.role,
    agent: resolveAgent(config, step.role, step.agent),
  }));
}

/**
 * Resolve the review mode based on labels
 */
export function resolveReviewMode(
  labels: string[],
  config: StashConfig,
): DefaultsConfig['review'] {
  if (labels.includes(config.labels.require_review)) {
    return 'required';
  }

  if (labels.includes(config.labels.skip_review)) {
    return 'skip';
  }

  return config.defaults.review;
}
