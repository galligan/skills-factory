import { describe, expect, test } from 'bun:test';
import { extractField, sanitizeLines, issueTitleToName } from '../src/utils/fields.js';

describe('extractField', () => {
  test('extracts field from markdown with ### heading', () => {
    const body = `
### Name
My Skill

### Description
This is a description.
`;
    expect(extractField(body, 'Name')).toBe('My Skill');
    expect(extractField(body, 'Description')).toBe('This is a description.');
  });

  test('returns null for missing field', () => {
    const body = `
### Name
My Skill
`;
    expect(extractField(body, 'Description')).toBeNull();
  });

  test('handles multiline field content', () => {
    const body = `
### Description
Line 1
Line 2
Line 3

### Other
Something
`;
    const result = extractField(body, 'Description');
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
    expect(result).toContain('Line 3');
  });

  test('is case insensitive', () => {
    const body = `
### NAME
Value
`;
    expect(extractField(body, 'Name')).toBe('Value');
    expect(extractField(body, 'name')).toBe('Value');
  });

  test('handles field at end of content', () => {
    const body = `
### Name
Final value without trailing heading
`;
    expect(extractField(body, 'Name')).toBe('Final value without trailing heading');
  });
});

describe('sanitizeLines', () => {
  test('trims whitespace from each line', () => {
    const input = '  line1  \n  line2  ';
    expect(sanitizeLines(input)).toBe('line1\nline2');
  });

  test('removes empty lines', () => {
    const input = 'line1\n\n\nline2\n\nline3';
    expect(sanitizeLines(input)).toBe('line1\nline2\nline3');
  });

  test('handles CRLF line endings', () => {
    const input = 'line1\r\n\r\nline2';
    expect(sanitizeLines(input)).toBe('line1\nline2');
  });

  test('returns empty string for all-whitespace input', () => {
    expect(sanitizeLines('   \n   \n   ')).toBe('');
  });
});

describe('issueTitleToName', () => {
  test('extracts skill name from issue title', () => {
    expect(issueTitleToName('skill: my-new-skill')).toBe('my-new-skill');
    expect(issueTitleToName('Skill: Another Skill')).toBe('Another Skill');
  });

  test('handles extra whitespace', () => {
    expect(issueTitleToName('skill:    spaced-skill  ')).toBe('spaced-skill');
  });

  test('returns null for non-matching titles', () => {
    expect(issueTitleToName('feature: not a skill')).toBeNull();
    expect(issueTitleToName('random title')).toBeNull();
    expect(issueTitleToName('')).toBeNull();
  });

  test('is case insensitive', () => {
    expect(issueTitleToName('SKILL: uppercase')).toBe('uppercase');
    expect(issueTitleToName('SkIlL: mixed')).toBe('mixed');
  });
});
