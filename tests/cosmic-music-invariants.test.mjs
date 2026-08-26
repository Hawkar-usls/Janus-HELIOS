import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [music, config, html, docs] = await Promise.all([
  readFile(new URL('../helios-music.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../docs/COSMIC_SYNTH_ENGINE.md', import.meta.url), 'utf8')
]);

const cfg = JSON.parse(config).procedural_audio;

assert.equal(cfg.enabled, true);
assert.equal(cfg.default_on, false);
assert.equal(cfg.engine, 'WEB_AUDIO_EVENT_GENERATIVE');
assert.equal(cfg.presentation_only, true);
assert.equal(cfg.affects_rng, false);
assert.equal(cfg.affects_payout, false);
assert.equal(cfg.affects_compute_route, false);
assert.equal(cfg.external_audio_assets_required, false);
assert.match(cfg.architecture_inspiration, /NERDMINER_V2/);

assert.equal(cfg.profiles.helios.name, 'D LYDIAN ORBIT');
assert.equal(cfg.profiles.divine.name, 'A LYDIAN AETHER');
assert.equal(cfg.profiles.gridjack.name, 'E DORIAN PULSE');
assert.equal(cfg.profiles.custom.name, 'C# VOID MINOR');

for (const forbidden of ['BET_SIZE','LOSS_STREAK','NEAR_MISS','WAGERING_HISTORY','PLAYER_VULNERABILITY']) {
  assert.ok(cfg.forbidden_adaptation_inputs.includes(forbidden));
}

assert.match(music, /AudioContext/);
assert.match(music, /createOscillator/);
assert.match(music, /createConvolver/);
assert.match(music, /helios:cascade/);
assert.match(music, /helios:spin-complete/);
assert.match(music, /helios:solar-corona/);
assert.match(music, /helios:spin-energy-earned/);
assert.match(music, /data-game-mode/);
assert.match(music, /selected-route/);
assert.match(music, /compute-state/);
assert.equal(music.includes("$('bet')"), false);
assert.equal(/lossStreak|nearMiss|wageringHistory|playerVulnerability/i.test(music), false);

assert.match(html, /helios-music\.js\?v=1\.0\.0/);
assert.match(html, /EVENT-GENERATED AUDIO/);
assert.match(docs, /NerdMiner_v2/);
assert.match(docs, /No NerdMiner source code is copied/);

console.log('HELIOS cosmic procedural music invariants: PASS');
