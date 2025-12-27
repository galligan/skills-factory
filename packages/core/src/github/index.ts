/**
 * GitHub module - event types and utilities
 */

export {
  type IssueEvent,
  type PullRequestEvent,
  type AutomationMode,
  resolveAutomationMode,
} from './events.js';

// Re-export field utilities commonly used with GitHub events
export { extractField, sanitizeLines, issueTitleToName } from '../utils/fields.js';
