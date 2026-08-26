import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, bonus, config] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8')
]);

const cfg = JSON.parse(config);
const corona = cfg.demo_solar_corona;

assert.match(html, /helios-bonus\.js\?v=1\.0\.0/);
assert.match(bonus, /SOLAR CORONA BONUS/);
assert.match(bonus, /SOLAR_BONUS_BANK/);
assert.match(bonus, /trigger_count:3/);
assert.match(bonus, /trigger_symbol:'☀'/);
assert.match(bonus, /compute_effect:'NONE'/);
assert.match(bonus, /route_effect:'NONE'/);
assert.equal(corona.enabled, true);
assert.deepEqual(corona.eligible_game_modes, ['helios']);
assert.equal(corona.trigger_symbol, '☀');
assert.equal(corona.trigger_count, 3);
assert.equal(corona.real_money_value, false);
assert.equal(corona.affects_compute, false);
assert.equal(corona.affects_rng, false);
assert.equal(corona.affects_route, false);
assert.equal(corona.reward_ledger, 'SOLAR_BONUS_BANK');

console.log('HELIOS Solar Corona invariants: PASS');
