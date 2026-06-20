import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const outputPath = resolve(process.env['VERSION_OUTPUT'] ?? 'public/version.json');
const commit = process.env['VITE_COMMIT_SHA'] ?? process.env['GITHUB_SHA'] ?? 'dev';
const buildTime = process.env['VITE_BUILD_TIME'] ?? new Date().toISOString();

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      commit,
      buildTime,
    },
    null,
    2,
  )}\n`,
);

console.log(`Wrote ${outputPath} for ${commit}`);
