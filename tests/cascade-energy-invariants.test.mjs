import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [core, config, html] = await Promise.all([
  readFile(new URL('../helios.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8')
]);

const cfg = JSON.parse(config);

assert.deepEqual(cfg.demo_cascades.multiplier_ladder, [1, 4, 16, 64]);
assert.equal(cfg.demo_cascades.affects_compute, false);
assert.equal(cfg.demo_cascades.compute_effect, 'NONE');
assert.deepEqual(cfg.demo_spin_energy.eligible_routes.sort(), ['custom','datacenter','jackpot','market','operator','science']);
assert.deepEqual(cfg.demo_spin_energy.eligible_game_modes, ['gridjack']);
assert.equal(cfg.demo_spin_energy.real_money_value, false);
assert.equal(cfg.demo_spin_energy.automatic_wager_conversion, false);

assert.match(core, /function collapseGrid/);
assert.match(core, /function resolveCascades/);
assert.match(core, /multiplier_ladder:\[1,4,16,64\]/);
assert.match(core, /helios:cascade/);
assert.match(core, /helios:spin-energy-earned/);
assert.match(core, /compute_effect:'NONE'/);
assert.match(core, /routeSupportsEnergy\(\)/);
assert.match(core, /STREAMING \$\{currentRoute\(\)\?\.short/);
assert.equal(core.includes('computeUnits*'), false);
assert.equal(core.includes('computeUnits *'), false);
assert.equal(core.includes('routeKey==='), false);

assert.match(html, /CASCADE x1→x64/);
assert.match(html, /helios\.js\?v=1\.6\.0/);
assert.match(html, /Paid symbols collapse and refill/);

console.log('HELIOS cascade + Spin Energy invariants: PASS');
