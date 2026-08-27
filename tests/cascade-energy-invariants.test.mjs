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
assert.deepEqual([...cfg.demo_spin_energy.eligible_routes].sort(), ['custom','datacenter','jackpot','market','operator','science']);
assert.deepEqual(cfg.demo_spin_energy.eligible_game_modes, ['gridjack']);
assert.equal(cfg.demo_spin_energy.real_money_value, false);
assert.equal(cfg.demo_spin_energy.automatic_wager_conversion, false);
assert.equal(cfg.demo_spin_energy.auto_play_from_bank, false);

// Current cascade implementation: paid cells are removed, survivors collapse,
// empty cells refill from the current mode distribution, then the grid is re-evaluated.
assert.match(core, /const CASCADE_LADDER=\[1,4,16,64\]/);
assert.match(core, /const CASCADE_MAX_STEPS=8/);
assert.match(core, /function collapseWinningCells\(grid,wins\)/);
assert.match(core, /async function animateCollapse\(grid,removed\)/);
assert.match(core, /async function refillGrid\(grid\)/);
assert.match(core, /while\(currentWins\.length&&cascadeCount<CASCADE_MAX_STEPS\)/);
assert.match(core, /const removed=collapseWinningCells\(grid,currentWins\)/);
assert.match(core, /await animateCollapse\(grid,removed\);await refillGrid\(grid\);cascadeCount\+\+;currentWins=evalGrid\(grid\)/);
assert.match(core, /helios:cascade/);
assert.match(core, /compute_effect:'NONE',initial_stop_effect:'NONE'/);

// Spin Energy is a separate demo-only source, accrued only under explicit eligible compute state.
assert.match(core, /function energyPolicy\(\)/);
assert.match(core, /function energyEligible\(\)/);
assert.match(core, /function tickSpinEnergy\(\)/);
assert.match(core, /helios:spin-energy-earned/);
assert.match(core, /game_balance_effect:'NONE'/);
assert.match(core, /automatic_wager_conversion:false/);
assert.match(core, /auto_play_from_bank:false/);
assert.match(core, /if\(isEnergy\)\{energyRewardUnits=spinWin/);
assert.equal(core.includes('computeUnits*'), false);
assert.equal(core.includes('computeUnits *'), false);

assert.match(html, /CASCADE x1→x64/);
assert.match(html, /helios\.js\?v=1\.7\.1/);
assert.match(html, /Paid symbols collapse and refill/);

console.log('HELIOS cascade + Spin Energy invariants: PASS');
