import { describe, expect, test } from 'bun:test';
import { normalizeSkillName, titleFromKebab, isKebabCase } from '../src/skill/naming.js';
import { skillDirectory, skillFilePath } from '../src/skill/paths.js';
import { buildSkillMarkdown } from '../src/skill/builder.js';

describe('normalizeSkillName', () => {
  test('converts spaces to hyphens', () => {
    const result = normalizeSkillName('My Skill Name');
    expect(result.name).toBe('my-skill-name');
    expect(result.changed).toBe(true);
  });

  test('lowercases the name', () => {
    const result = normalizeSkillName('MySkillName');
    expect(result.name).toBe('myskillname');
    expect(result.changed).toBe(true);
  });

  test('removes special characters', () => {
    const result = normalizeSkillName("skill's name!");
    expect(result.name).toBe('skills-name');
    expect(result.changed).toBe(true);
  });

  test('collapses multiple hyphens', () => {
    const result = normalizeSkillName('my--skill---name');
    expect(result.name).toBe('my-skill-name');
    expect(result.changed).toBe(true);
  });

  test('trims leading and trailing hyphens', () => {
    const result = normalizeSkillName('-my-skill-');
    expect(result.name).toBe('my-skill');
    expect(result.changed).toBe(true);
  });

  test('reports no change when already normalized', () => {
    const result = normalizeSkillName('already-kebab');
    expect(result.name).toBe('already-kebab');
    expect(result.changed).toBe(false);
  });
});

describe('titleFromKebab', () => {
  test('converts single word', () => {
    expect(titleFromKebab('skill')).toBe('Skill');
  });

  test('converts kebab-case to title case', () => {
    expect(titleFromKebab('my-skill-name')).toBe('My Skill Name');
  });

  test('handles single character words', () => {
    expect(titleFromKebab('a-b-c')).toBe('A B C');
  });
});

describe('isKebabCase (from naming)', () => {
  test('validates kebab-case', () => {
    expect(isKebabCase('valid-name')).toBe(true);
    expect(isKebabCase('Invalid-Name')).toBe(false);
  });
});

describe('skillDirectory', () => {
  test('returns path with default cwd', () => {
    const dir = skillDirectory('my-skill');
    expect(dir).toContain('skills');
    expect(dir).toContain('my-skill');
  });

  test('returns path with custom cwd', () => {
    const dir = skillDirectory('my-skill', '/custom/path');
    expect(dir).toBe('/custom/path/skills/my-skill');
  });
});

describe('skillFilePath', () => {
  test('returns SKILL.md path', () => {
    const filePath = skillFilePath('my-skill');
    expect(filePath).toContain('skills');
    expect(filePath).toContain('my-skill');
    expect(filePath).toContain('SKILL.md');
  });

  test('returns path with custom cwd', () => {
    const filePath = skillFilePath('my-skill', '/custom/path');
    expect(filePath).toBe('/custom/path/skills/my-skill/SKILL.md');
  });
});

describe('buildSkillMarkdown', () => {
  test('builds basic skill markdown', () => {
    const md = buildSkillMarkdown({
      name: 'my-skill',
      description: 'A test skill',
    });

    expect(md).toContain('---');
    expect(md).toContain('name: my-skill');
    expect(md).toContain('description: A test skill');
  });

  test('builds skill with spec content', () => {
    const md = buildSkillMarkdown({
      name: 'my-skill',
      description: 'A test skill',
      spec: 'Custom spec content here.',
    });

    expect(md).toContain('name: my-skill');
    expect(md).toContain('## Additional spec');
    expect(md).toContain('Custom spec content here.');
  });

  test('builds skill with sources', () => {
    const md = buildSkillMarkdown({
      name: 'my-skill',
      description: 'A test skill',
      sources: 'https://example.com/docs',
    });

    expect(md).toContain('## Sources');
    expect(md).toContain('https://example.com/docs');
  });

  test('generates proper structure with title and sections', () => {
    const md = buildSkillMarkdown({
      name: 'code-review',
      description: 'Review code for quality',
    });

    expect(md).toContain('# Code Review');
    expect(md).toContain('## When this skill activates');
    expect(md).toContain('## What this skill does');
  });

  test('result can be parsed back as valid frontmatter', () => {
    const md = buildSkillMarkdown({
      name: 'roundtrip-test',
      description: 'Testing roundtrip parsing',
    });

    // Extract and parse frontmatter
    const frontmatterMatch = md.match(/^---\s*\n([\s\S]*?)\n---/);
    expect(frontmatterMatch).toBeTruthy();

    const parsed = Bun.YAML.parse(frontmatterMatch![1]) as Record<string, unknown>;
    expect(parsed.name).toBe('roundtrip-test');
    expect(parsed.description).toBe('Testing roundtrip parsing');
  });
});
