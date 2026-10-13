#!/usr/bin/env node
// @krawlup/skills installer - copies the bundled agent skills into a target directory.
// Zero dependencies. Usage:
//   npx @krawlup/skills                 # installs into ./skills
//   npx @krawlup/skills --dir .claude/skills
//   npx @krawlup/skills --force         # overwrite existing skill folders

import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const bundledSkills = join(pkgRoot, 'skills');

const args = process.argv.slice(2);
let target = 'skills';
let force = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir' || args[i] === '-d') {
    target = args[++i] ?? '';
  } else if (args[i] === '--force' || args[i] === '-f') {
    force = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log('Usage: npx @krawlup/skills [--dir <target>] [--force]');
    console.log('  --dir, -d    target directory (default: ./skills)');
    console.log('  --force, -f  overwrite existing skill folders');
    process.exit(0);
  }
}

if (!target) {
  console.error('Error: --dir requires a path.');
  process.exit(1);
}

const available = readdirSync(bundledSkills).filter((name) =>
  existsSync(join(bundledSkills, name, 'SKILL.md')),
);
if (available.length === 0) {
  console.error('Error: no skills found in the package (unexpected).');
  process.exit(1);
}

const targetDir = resolve(process.cwd(), target);
const skipped = [];

for (const skill of available) {
  const dest = join(targetDir, skill);
  if (existsSync(dest) && !force) {
    skipped.push(skill);
    continue;
  }
  mkdirSync(dest, { recursive: true });
  cpSync(join(bundledSkills, skill), dest, { recursive: true });
  console.log(`Installed ${skill} -> ${dest}`);
}

if (skipped.length > 0) {
  console.warn(
    `\nSkipped ${skipped.length} existing skill(s): ${skipped.join(', ')}.\nRe-run with --force to overwrite.`,
  );
}
console.log(`\nDone. ${available.length - skipped.length}/${available.length} krawlup skill(s) installed in ${targetDir}.`);
