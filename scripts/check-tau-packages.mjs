import { execFileSync } from 'node:child_process';

const packages = ['@taucad/runtime', '@taucad/types'];

for (const packageName of packages) {
  const version = execFileSync('npm', ['view', `${packageName}@beta`, 'version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();

  console.log(`${packageName}@beta ${version}`);
}
