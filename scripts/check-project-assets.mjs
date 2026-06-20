import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const defaultSource = '/Users/ahmadjalil/github/tau/apps/ui/app/routes/playground/projects';
const source = resolve(process.argv[2] ?? process.env['TAU_PLAYGROUND_PROJECTS'] ?? defaultSource);
const destination = resolve('public/projects');

const knownMissingIncludes = new Map([
  ['keyguard-with-raised-tabs/main.scad', new Set(['screenshot.svg'])],
  ['saboteur-card-holder/main.scad', new Set(['grid.scad'])],
  ['tray-scad/main.scad', new Set(['Untitled-1.scad'])],
  ['wham/main.scad', new Set(['Untitled-1.scad'])],
]);

if (!existsSync(source)) {
  throw new Error(`Tau playground projects directory not found: ${source}`);
}

const upstreamFiles = listFiles(source).filter((file) => file !== 'AGENTS.md');
const galleryFiles = listFiles(destination);
const errors = [];

for (const file of upstreamFiles) {
  if (!galleryFiles.includes(file)) {
    errors.push(`Missing copied project asset: ${file}`);
  }
}

for (const file of galleryFiles) {
  if (!upstreamFiles.includes(file)) {
    errors.push(`Extra gallery project asset not present upstream: ${file}`);
  }
}

for (const file of galleryFiles.filter((name) => name.endsWith('.scad'))) {
  const missing = findMissingLocalScadDependencies(file);
  const allowed = knownMissingIncludes.get(file) ?? new Set();
  for (const dependency of missing) {
    if (!allowed.has(dependency)) {
      errors.push(`Missing local SCAD dependency referenced by ${file}: ${dependency}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Verified ${galleryFiles.length} copied project assets against ${source}`);

function listFiles(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory).sort()) {
      const path = join(directory, entry);
      const stat = statSync(path);
      if (stat.isDirectory()) {
        visit(path);
      } else {
        files.push(relative(root, path));
      }
    }
  };

  visit(root);
  return files;
}

function findMissingLocalScadDependencies(file) {
  const fullPath = join(destination, file);
  const sourceCode = readFileSync(fullPath, 'utf8');
  const localDependencies = new Set();
  const includeRegex = /^\s*(?:use|include)\s*<([^>]+)>/gm;
  const importRegex = /import\s*\(\s*(?:file\s*=\s*)?["']([^"']+)["']/gm;

  for (const regex of [includeRegex, importRegex]) {
    let match;
    while ((match = regex.exec(sourceCode)) !== null) {
      const dependency = match[1];
      if (!dependency || dependency.startsWith('BOSL2/')) {
        continue;
      }

      localDependencies.add(dependency);
    }
  }

  return [...localDependencies].filter((dependency) => !existsSync(join(destination, file, '..', dependency)));
}
