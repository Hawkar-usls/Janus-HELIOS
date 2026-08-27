import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname);
const outputArg = process.argv.find(x => x.startsWith('--output='));
const strict = process.argv.includes('--strict');
const output = resolve(root, outputArg ? outputArg.slice('--output='.length) : 'artifacts/closing-manifest.json');

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

const commit = git(['rev-parse', 'HEAD']);
const tree = git(['rev-parse', 'HEAD^{tree}']);
const status = git(['status', '--porcelain=v1', '--untracked-files=all']);
const dirty = Boolean(status);

if (strict && dirty) {
  console.error('CLOSING_MANIFEST_REFUSED: working tree is dirty');
  process.exit(2);
}

const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root })
  .toString('utf8')
  .split('\0')
  .filter(Boolean)
  .sort();

const outputRelative = output.startsWith(root) ? output.slice(root.length + 1).replaceAll('\\', '/') : null;
const files = [];
for (const path of tracked) {
  if (path === outputRelative) continue;
  const bytes = await readFile(resolve(root, path));
  files.push({
    path,
    bytes: bytes.byteLength,
    sha256: sha256(bytes)
  });
}

let packageVersion = null;
try {
  packageVersion = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8')).version ?? null;
} catch {}

const manifest = {
  schema: 'janus.helios.closing-manifest.v1',
  generated_at_utc: new Date().toISOString(),
  repository: 'Hawkar-usls/Janus-HELIOS',
  package_version: packageVersion,
  git_commit_sha: commit,
  git_tree_sha: tree,
  working_tree_dirty: dirty,
  strict_mode: strict,
  tracked_file_count: files.length,
  files,
  claims: {
    test_suite_passed: false,
    security_certified: false,
    production_ready: false,
    note: 'This manifest proves file identity only. Test/security/production claims require separate evidence for this exact commit.'
  }
};

manifest.manifest_payload_sha256 = sha256(Buffer.from(canonicalJson(manifest)));

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`HELIOS closing manifest written: ${output}`);
console.log(`commit=${commit}`);
console.log(`tree=${tree}`);
console.log(`files=${files.length}`);
console.log(`manifest_payload_sha256=${manifest.manifest_payload_sha256}`);
if (dirty) console.warn('WARNING: working tree was dirty; do not use this manifest for closing without resolving differences.');
