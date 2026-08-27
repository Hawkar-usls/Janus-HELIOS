import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(new URL('..', import.meta.url).pathname);
const outputArg = process.argv.find(x => x.startsWith('--output='));
const output = resolve(root, outputArg ? outputArg.slice('--output='.length) : 'artifacts/declared-sbom.cdx.json');

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function purl(name, version) {
  const encoded = name.startsWith('@')
    ? name.slice(1).split('/').map(encodeURIComponent).join('/')
    : encodeURIComponent(name);
  return `pkg:npm/${encoded}@${encodeURIComponent(version)}`;
}

const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const groups = [
  ['dependencies', 'required'],
  ['optionalDependencies', 'optional'],
  ['peerDependencies', 'peer'],
  ['devDependencies', 'development']
];

const components = [];
for (const [field, scope] of groups) {
  for (const [name, versionSpec] of Object.entries(pkg[field] || {})) {
    components.push({
      type: 'library',
      name,
      version: String(versionSpec),
      purl: purl(name, String(versionSpec)),
      scope,
      properties: [
        { name: 'janus:declaration-source', value: `package.json#${field}` },
        { name: 'janus:version-is-package-specifier', value: 'true' }
      ]
    });
  }
}
components.sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`));

const commit = git(['rev-parse', 'HEAD']);
const tree = git(['rev-parse', 'HEAD^{tree}']);
const serialSeed = createHash('sha256').update(`${commit}:${tree}:declared-sbom`).digest('hex');

const bom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.6',
  serialNumber: `urn:uuid:${serialSeed.slice(0,8)}-${serialSeed.slice(8,12)}-4${serialSeed.slice(13,16)}-8${serialSeed.slice(17,20)}-${serialSeed.slice(20,32)}`,
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    component: {
      type: 'application',
      name: pkg.name || 'Janus-HELIOS',
      version: pkg.version || 'unknown',
      properties: [
        { name: 'janus:repository', value: 'Hawkar-usls/Janus-HELIOS' },
        { name: 'janus:git-commit-sha', value: commit },
        { name: 'janus:git-tree-sha', value: tree },
        { name: 'janus:sbom-scope', value: 'DECLARED_PACKAGE_JSON_DEPENDENCIES_ONLY' },
        { name: 'janus:independent-scan', value: 'false' }
      ]
    }
  },
  components,
  properties: [
    { name: 'janus:warning', value: 'This SBOM inventories dependencies declared in package.json only. It does not discover vendored, browser-loaded, generated, firmware, OS, vendor-SDK, transitive-unlocked, or otherwise undeclared material.' },
    { name: 'janus:closing-requirement', value: 'Run an independent automated SBOM/license scan against the exact closing snapshot.' }
  ]
};

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(bom, null, 2)}\n`, 'utf8');
console.log(`HELIOS declared SBOM written: ${output}`);
console.log(`commit=${commit}`);
console.log(`declared_components=${components.length}`);
console.log('scope=DECLARED_PACKAGE_JSON_DEPENDENCIES_ONLY');
