#!/usr/bin/env bun
import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

interface Options {
  template: string;
  marketplace?: string;
  ownerName?: string;
  ownerEmail?: string;
  origin?: string;
  upstream: boolean;
}

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  printHelp();
  process.exit(0);
}

const { target, options } = parseArgs(args);

if (!target) {
  console.error('Error: target directory is required.');
  printHelp();
  process.exit(1);
}

const targetPath = resolve(process.cwd(), target);

if (existsSync(targetPath) && !isEmptyDir(targetPath)) {
  console.error(`Error: ${targetPath} already exists and is not empty.`);
  process.exit(1);
}

const templateUrl = normalizeTemplateUrl(options.template);

run('git', ['clone', templateUrl, targetPath]);

const repoName = basename(targetPath);
const marketplaceName = options.marketplace ?? toKebab(repoName);
const ownerName = options.ownerName ?? readGitConfig('user.name') ?? 'Skillstash';
const ownerEmail = options.ownerEmail ?? readGitConfig('user.email') ?? undefined;

await updatePluginManifest(targetPath, ownerName, ownerEmail);
await updateMarketplace(targetPath, marketplaceName, ownerName, ownerEmail);

await updateGitRemotes(targetPath, templateUrl, options.origin, options.upstream);

console.log('\nSkillstash ready:');
console.log(`  cd ${target}`);
if (!options.origin) {
  console.log('  git remote set-url origin <your-repo-url>');
}

function printHelp() {
  console.log(`\ncreate-skillstash <dir> [options]\n\nOptions:\n  --template <owner/repo|url>   Template repo (default: galligan/skillstash)\n  --marketplace <name>          Marketplace name (default: <dir> in kebab-case)\n  --owner-name <name>           Marketplace owner name (default: git user.name)\n  --owner-email <email>         Marketplace owner email (default: git user.email)\n  --origin <url>                Set origin remote to your repo URL\n  --upstream                    Add upstream remote (default: true)\n  --no-upstream                 Skip adding upstream remote\n  -h, --help                    Show this help\n`);
}

function parseArgs(argv: string[]): { target: string | null; options: Options } {
  const options: Options = {
    template: 'galligan/skillstash',
    upstream: true,
  };
  let target: string | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;

    if (!arg.startsWith('-') && !target) {
      target = arg;
      continue;
    }

    switch (arg) {
      case '--template':
      case '-t':
        options.template = argv[++i] ?? options.template;
        break;
      case '--marketplace':
        options.marketplace = argv[++i];
        break;
      case '--owner-name':
        options.ownerName = argv[++i];
        break;
      case '--owner-email':
        options.ownerEmail = argv[++i];
        break;
      case '--origin':
        options.origin = argv[++i];
        break;
      case '--upstream':
        options.upstream = true;
        break;
      case '--no-upstream':
        options.upstream = false;
        break;
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
      default:
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return { target, options };
}

function normalizeTemplateUrl(template: string): string {
  if (template.startsWith('http://') || template.startsWith('https://')) {
    return template;
  }
  if (template.startsWith('git@')) {
    return template;
  }
  if (template.endsWith('.git')) {
    return `https://github.com/${template}`;
  }
  return `https://github.com/${template}.git`;
}

function run(cmd: string, args: string[]) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function isEmptyDir(path: string): boolean {
  try {
    return readdirSync(path).length === 0;
  } catch {
    return true;
  }
}

function readGitConfig(key: string): string | null {
  try {
    const value = execSync(`git config --get ${key}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
    return value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function toKebab(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

async function updatePluginManifest(root: string, ownerName: string, ownerEmail?: string) {
  const path = join(root, '.claude-plugin', 'plugin.json');
  if (!existsSync(path)) return;

  const raw = await readFile(path, 'utf-8');
  const data = JSON.parse(raw) as Record<string, unknown>;
  const author: Record<string, string> = { name: ownerName };
  if (ownerEmail) author.email = ownerEmail;
  data.author = author;

  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

async function updateMarketplace(root: string, marketplace: string, ownerName: string, ownerEmail?: string) {
  const path = join(root, '.claude-plugin', 'marketplace.json');
  if (!existsSync(path)) return;

  const raw = await readFile(path, 'utf-8');
  const data = JSON.parse(raw) as Record<string, unknown>;

  data.name = marketplace;

  const owner: Record<string, string> = { name: ownerName };
  if (ownerEmail) owner.email = ownerEmail;
  data.owner = owner;

  if (Array.isArray(data.plugins)) {
    data.plugins = data.plugins.map(plugin => {
      if (!plugin || typeof plugin !== 'object') return plugin;
      const updated = { ...plugin } as Record<string, unknown>;
      if (typeof updated.author === 'object' && updated.author) {
        updated.author = { ...(updated.author as Record<string, unknown>), name: ownerName };
        if (ownerEmail) {
          (updated.author as Record<string, unknown>).email = ownerEmail;
        }
      } else {
        const author: Record<string, string> = { name: ownerName };
        if (ownerEmail) author.email = ownerEmail;
        updated.author = author;
      }
      return updated;
    });
  }

  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

async function updateGitRemotes(
  root: string,
  templateUrl: string,
  originUrl: string | undefined,
  upstream: boolean,
) {
  if (originUrl) {
    run('git', ['-C', root, 'remote', 'set-url', 'origin', originUrl]);
    if (upstream) {
      run('git', ['-C', root, 'remote', 'add', 'upstream', templateUrl]);
    }
    return;
  }

  if (upstream) {
    // Keep origin pointing to the template; no upstream to avoid duplicates.
    return;
  }
}
