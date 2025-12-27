/**
 * GitHub event type definitions
 */

export type IssueEvent = {
  issue: {
    number: number;
    title: string;
    body: string | null;
    labels: Array<{ name: string }>;
  };
  repository: {
    owner: { login: string };
    name: string;
    full_name?: string;
  };
};

export type PullRequestEvent = {
  pull_request: {
    number: number;
    title: string;
    body: string | null;
    head: { ref: string };
    labels: Array<{ name: string }>;
  };
  repository: {
    owner: { login: string };
    name: string;
    full_name: string;
  };
};

export type AutomationMode = 'app' | 'github';

/**
 * Resolve the automation mode based on available tokens
 */
export function resolveAutomationMode(hasAppToken: boolean): AutomationMode {
  return hasAppToken ? 'app' : 'github';
}
