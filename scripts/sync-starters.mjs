#!/usr/bin/env node
// Copies every template in catalogue.json from its own repository into its
// folder, records the commit it copied, and rewrites the catalogue in README.md.
//
// shortcut: the gallery still deploys from each template's own repository, so
// that repository is the source and this folder is a copy. Once the platform
// copies a single folder of this repository at deploy, make this the source
// and turn the script around.
//
// Usage: node scripts/sync-starters.mjs [slug ...]   (no slug: all of them)

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const cataloguePath = join(root, 'catalogue.json');
const catalogue = JSON.parse(readFileSync(cataloguePath, 'utf8'));
const only = new Set(process.argv.slice(2));

const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();

for (const entry of catalogue) {
  if (only.size && !only.has(entry.slug)) continue;
  const work = mkdtempSync(join(tmpdir(), 'lc-template-'));
  try {
    git(['clone', '--quiet', '--depth', '1', `https://github.com/${entry.repo}.git`, work]);
    entry.commit = git(['rev-parse', 'HEAD'], work);
    rmSync(join(work, '.git'), { recursive: true, force: true });

    const folder = join(root, entry.folder);
    // Files that exist only here (an upstream licence the source repository lacks).
    const keep = new Set(entry.keep ?? []);
    if (existsSync(folder)) {
      for (const name of readdirSync(folder)) {
        if (!keep.has(name)) rmSync(join(folder, name), { recursive: true, force: true });
      }
    }
    cpSync(work, folder, { recursive: true });
    console.log(`${entry.folder}  ${entry.repo}@${entry.commit.slice(0, 7)}`);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

writeFileSync(cataloguePath, JSON.stringify(catalogue, null, 2) + '\n');

// The catalogue table in README.md, between the two markers.
const deployUrl = (repo) => `https://console.light-cloud.com/new?repo=https://github.com/${repo}`;
const rows = catalogue.map(
  (t) =>
    `| [${t.name}](./${t.folder}) | ${t.description} | ${t.language} | ${t.database ? 'PostgreSQL' : ''} | [![Deploy to Light Cloud](https://light-cloud.com/button.svg)](${deployUrl(t.repo)}) |`
);
const table = [
  '<!-- catalogue:start (written by scripts/sync-starters.mjs) -->',
  '| Template | What it is | Language | Database | Deploy |',
  '| --- | --- | --- | --- | --- |',
  ...rows,
  '<!-- catalogue:end -->',
].join('\n');
const readmePath = join(root, 'README.md');
const readme = readFileSync(readmePath, 'utf8');
const updated = readme.replace(/<!-- catalogue:start[\s\S]*?<!-- catalogue:end -->/, table);
if (updated === readme && !readme.includes('<!-- catalogue:start')) {
  throw new Error('README.md has no catalogue markers');
}
writeFileSync(readmePath, updated);
console.log(`README.md: ${catalogue.length} templates`);
