import { cpSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const defaultSource = '/Users/ahmadjalil/github/tau/apps/ui/app/routes/playground/projects';
const source = resolve(process.argv[2] ?? process.env['TAU_PLAYGROUND_PROJECTS'] ?? defaultSource);
const destination = resolve('public/projects');

if (!existsSync(source)) {
  throw new Error(`Tau playground projects directory not found: ${source}`);
}

rmSync(destination, { force: true, recursive: true });
cpSync(source, destination, {
  recursive: true,
  filter: (path) => !path.endsWith(`${join('projects', 'AGENTS.md')}`) && !path.endsWith('/AGENTS.md'),
});

console.log(`Synced Tau playground projects from ${source} to ${destination}`);
