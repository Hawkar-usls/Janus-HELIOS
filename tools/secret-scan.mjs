import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname);
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root })
  .toString('utf8')
  .split('\0')
  .filter(Boolean)
  .sort();

const patterns = [
  ['PRIVATE_KEY_PEM', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ['AWS_ACCESS_KEY_ID', /\bAKIA[0-9A-Z]{16}\b/g],
  ['GITHUB_CLASSIC_TOKEN', /\bgh[pousr]_[A-Za-z0-9]{36,255}\b/g],
  ['GITHUB_FINE_GRAINED_TOKEN', /\bgithub_pat_[A-Za-z0-9_]{40,255}\b/g],
  ['GOOGLE_API_KEY', /\bAIza[0-9A-Za-z_-]{35}\b/g],
  ['SLACK_TOKEN', /\bxox[baprs]-[0-9A-Za-z-]{20,255}\b/g]
];

const binaryExtensions = /\.(?:png|jpe?g|gif|webp|ico|woff2?|ttf|otf|zip|gz|pdf|mp3|wav|ogg|mp4|mov|bin)$/i;
const findings = [];

for (const path of tracked) {
  if (binaryExtensions.test(path)) continue;
  let text;
  try { text = await readFile(resolve(root, path), 'utf8'); } catch { continue; }
  for (const [kind, regex] of patterns) {
    regex.lastIndex = 0;
    for (const match of text.matchAll(regex)) {
      const before = text.slice(0, match.index);
      const line = before.split('\n').length;
      findings.push({ path, line, kind });
    }
  }
}

if (findings.length) {
  console.error('HELIOS HIGH-CONFIDENCE SECRET SCAN: FAIL');
  for (const f of findings) console.error(`${f.kind} ${f.path}:${f.line}`);
  process.exit(1);
}

console.log(`HELIOS high-confidence secret scan: PASS (${tracked.length} tracked files checked)`);
console.log('NOTE: this lightweight scanner is not a substitute for a dedicated enterprise secret scanner at closing.');
