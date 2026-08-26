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
assert.equal(cfg.engine, 'WEB_AUDIO_MODE_ROUTE_EVENT_GENERATIVE_V3');
assert.equal(cfg.transport_division, '1/16');
assert.equal(cfg.master_gain, 0.30);
assert.equal(cfg.unique_session_seed, true);
assert.equal(cfg.presentation_only, true);
assert.equal(cfg.affects_rng, false);
assert.equal(cfg.affects_payout, false);
assert.equal(cfg.affects_compute_route, false);
assert.equal(cfg.external_audio_assets_required, false);
assert.match(cfg.architecture_inspiration, /NERDMINER_V2/);

for (const layer of ['SOLAR_PULSE','SUB_BASS','ORBITAL_BASS','ARPEGGIATOR','COSMIC_PAD','STARFIELD_BELLS','COMPUTE_DRONE','EVENT_FILLS']) {
  assert.ok(cfg.layers.includes(layer), `missing layer ${layer}`);
}
for (const route of ['MARKET','SCIENCE','TREASURY','DC','OPERATOR','CUSTOM']) {
  assert.ok(cfg.route_profiles[route], `missing route profile ${route}`);
}
assert.equal(cfg.profiles.helios.name, 'D LYDIAN ORBIT');
assert.equal(cfg.profiles.divine.name, 'A LYDIAN AETHER');
assert.equal(cfg.profiles.gridjack.name, 'E DORIAN PULSE');
assert.equal(cfg.profiles.custom.name, 'C# VOID MINOR');

for (const forbidden of ['BET_SIZE','LOSS_STREAK','NEAR_MISS','WAGERING_HISTORY','PLAYER_VULNERABILITY']) {
  assert.ok(cfg.forbidden_adaptation_inputs.includes(forbidden));
}

assert.match(music, /function scheduleTransportStep/);
assert.match(music, /function schedulerTick/);
assert.match(music, /function kick/);
assert.match(music, /function noiseHit/);
assert.match(music, /function pad/);
assert.match(music, /function bell/);
assert.match(music, /sessionSeed/);
assert.match(music, /effectiveBpm/);
assert.match(music, /routeProfile/);
assert.match(music, /helios:cascade/);
assert.match(music, /helios:spin-complete/);
assert.match(music, /helios:solar-corona/);
assert.match(music, /helios:spin-energy-earned/);
assert.match(music, /helios:lucky-contribution/);
assert.match(music, /helios:bonus-buy-start/);
assert.match(music, /helios-lucky\.js/);
assert.match(music, /computeActive/);
assert.equal(music.includes("$('bet')"), false);
assert.equal(/lossStreak|nearMiss|wageringHistory|playerVulnerability/i.test(music), false);

assert.match(html, /helios-music\.js\?v=/);
assert.match(html, /LIVE GENERATIVE MUSIC/);
assert.match(docs, /NerdMiner_v2/);
assert.match(docs, /No NerdMiner source code is copied/);

console.log('HELIOS mode-route-event generative music invariants: PASS');
