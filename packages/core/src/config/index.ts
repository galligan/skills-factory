/**
 * Config module - types, defaults, and loading
 */

export type {
  StashConfig,
  DefaultsConfig,
  LabelsConfig,
  ValidationConfig,
  AgentName,
  WorkflowRole,
  AgentsConfig,
  WorkflowStep,
} from './types.js';

export { DEFAULT_CONFIG } from './defaults.js';
export { loadConfig } from './loader.js';
