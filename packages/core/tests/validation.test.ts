import { describe, expect, test } from 'bun:test';
import {
  isKebabCase,
  countLines,
  asNumber,
  asBoolean,
  asStringArray,
} from '../src/validation/rules.js';
import { extractFrontmatter } from '../src/validation/frontmatter.js';
import { summarizeResults } from '../src/validation/reporter.js';
import type { SkillValidation } from '../src/validation/types.js';

describe('isKebabCase', () => {
  test('accepts valid kebab-case names', () => {
    expect(isKebabCase('my-skill')).toBe(true);
    expect(isKebabCase('skill')).toBe(true);
    expect(isKebabCase('multi-word-name')).toBe(true);
    expect(isKebabCase('skill123')).toBe(true);
    expect(isKebabCase('skill-v2')).toBe(true);
  });

  test('rejects invalid names', () => {
    expect(isKebabCase('MySkill')).toBe(false);
    expect(isKebabCase('my_skill')).toBe(false);
    expect(isKebabCase('my skill')).toBe(false);
    expect(isKebabCase('MY-SKILL')).toBe(false);
    expect(isKebabCase('-leading-hyphen')).toBe(false);
    expect(isKebabCase('trailing-hyphen-')).toBe(false);
    expect(isKebabCase('double--hyphen')).toBe(false);
    expect(isKebabCase('')).toBe(false);
  });
});

describe('countLines', () => {
  test('counts single line', () => {
    expect(countLines('hello')).toBe(1);
  });

  test('counts multiple lines', () => {
    expect(countLines('line1\nline2\nline3')).toBe(3);
  });

  test('counts empty content as 1 line', () => {
    expect(countLines('')).toBe(1);
  });

  test('handles trailing newline', () => {
    expect(countLines('line1\nline2\n')).toBe(3);
  });
});

describe('type coercion helpers', () => {
  test('asNumber returns number when valid', () => {
    expect(asNumber(42, 0)).toBe(42);
    expect(asNumber(0, 100)).toBe(0);
    expect(asNumber(-5, 0)).toBe(-5);
  });

  test('asNumber returns fallback for invalid values', () => {
    expect(asNumber('42', 0)).toBe(0);
    expect(asNumber(null, 100)).toBe(100);
    expect(asNumber(undefined, 50)).toBe(50);
    expect(asNumber(NaN, 10)).toBe(10);
    expect(asNumber(Infinity, 10)).toBe(10);
  });

  test('asBoolean returns boolean when valid', () => {
    expect(asBoolean(true, false)).toBe(true);
    expect(asBoolean(false, true)).toBe(false);
  });

  test('asBoolean returns fallback for non-boolean', () => {
    expect(asBoolean('true', false)).toBe(false);
    expect(asBoolean(1, false)).toBe(false);
    expect(asBoolean(null, true)).toBe(true);
  });

  test('asStringArray returns array when valid', () => {
    expect(asStringArray(['a', 'b'], [])).toEqual(['a', 'b']);
    expect(asStringArray([], ['default'])).toEqual([]);
  });

  test('asStringArray returns fallback for invalid values', () => {
    expect(asStringArray('string', ['default'])).toEqual(['default']);
    expect(asStringArray([1, 2, 3], ['default'])).toEqual(['default']);
    expect(asStringArray(['a', 1, 'b'], ['default'])).toEqual(['default']);
    expect(asStringArray(null, ['default'])).toEqual(['default']);
  });
});

describe('extractFrontmatter', () => {
  test('extracts valid YAML frontmatter', () => {
    const content = `---
name: my-skill
description: A test skill
---

# Content here
`;
    const result = extractFrontmatter(content);
    expect(result.error).toBeNull();
    expect(result.frontmatter).toEqual({
      name: 'my-skill',
      description: 'A test skill',
    });
  });

  test('returns error for missing frontmatter', () => {
    const content = `# Just content
No frontmatter here`;
    const result = extractFrontmatter(content);
    expect(result.frontmatter).toBeNull();
    expect(result.error).toContain('No YAML frontmatter found');
  });

  test('returns error for invalid YAML', () => {
    const content = `---
name: [invalid: yaml
---

# Content`;
    const result = extractFrontmatter(content);
    expect(result.frontmatter).toBeNull();
    expect(result.error).toContain('Invalid YAML');
  });

  test('handles frontmatter with additional fields', () => {
    const content = `---
name: my-skill
description: Test
custom_field: value
tags:
  - one
  - two
---
`;
    const result = extractFrontmatter(content);
    expect(result.error).toBeNull();
    expect(result.frontmatter?.name).toBe('my-skill');
    expect(result.frontmatter?.custom_field).toBe('value');
    expect(result.frontmatter?.tags).toEqual(['one', 'two']);
  });
});

describe('summarizeResults', () => {
  test('summarizes empty results', () => {
    const summary = summarizeResults([]);
    expect(summary).toEqual({
      skillsChecked: 0,
      totalErrors: 0,
      totalWarnings: 0,
      passed: true,
    });
  });

  test('summarizes passing results', () => {
    const results: SkillValidation[] = [
      { skillPath: '/path/a', skillName: 'a', errors: [], warnings: [] },
      { skillPath: '/path/b', skillName: 'b', errors: [], warnings: [] },
    ];
    const summary = summarizeResults(results);
    expect(summary).toEqual({
      skillsChecked: 2,
      totalErrors: 0,
      totalWarnings: 0,
      passed: true,
    });
  });

  test('summarizes failing results', () => {
    const results: SkillValidation[] = [
      {
        skillPath: '/path/a',
        skillName: 'a',
        errors: [{ file: '/path/a', message: 'Error 1', severity: 'error' }],
        warnings: [{ file: '/path/a', message: 'Warn 1', severity: 'warning' }],
      },
      {
        skillPath: '/path/b',
        skillName: 'b',
        errors: [
          { file: '/path/b', message: 'Error 2', severity: 'error' },
          { file: '/path/b', message: 'Error 3', severity: 'error' },
        ],
        warnings: [],
      },
    ];
    const summary = summarizeResults(results);
    expect(summary).toEqual({
      skillsChecked: 2,
      totalErrors: 3,
      totalWarnings: 1,
      passed: false,
    });
  });
});
