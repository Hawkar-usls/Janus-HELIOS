import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [core, config, html] = await Promise.all([
  readFile(new URL('../helios.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8')
]);

const cfg = JSON.parse(config);

assert.deepEqual(cfg.demo_cascades.multiplier_ladder, [1, 4, 16, 64]);
assert.equal(cfg.demo_cascades.max_cascades, 8);
assert.equal(cfg.demo_cascades.affects_compute, false);
assert.equal(cfg.demo_cascades.compute_effect, 'NONE');
assert.deepEqual([...cfg.demo_spin_energy.eligible_routes].sort(), ['custom','datacenter','jackpot','market','operator','science']);
assert.deepEqual(cfg.demo_spin_energy.eligible_game_modes, ['gridjack']);
assert.equal(cfg.demo_spin_energy.real_money_value, false);
assert.equal(cfg.demo_spin_energy.automatic_wager_conversion, false);
assert.equal(cfg.demo_spin_energy.auto_play_from_bank, false);

// Restored cascade implementation: evaluate -> mark paid cells -> collapse -> animate/refill -> evaluate again.
assert.match(core, /const DEFAULT_CASCADE_POLICY = \{/);
assert.match(core, /multiplier_ladder:\[1,4,16,64\]/);
assert.match(core, /max_cascades:8/);
assert.match(core, /function collapseGrid\(grid,hits\)/);
assert.match(core, /function cascadeMultiplierAt\(index\)/);
assert.match(core, /async function animateCascade\(grid,hits,nextGrid,multiplier,cascadeNo,payout\)/);
assert.match(core, /async function resolveCascades\(initialGrid,bet\)/);
assert.match(core, /while\(cascadeNo<cascadePolicy\.max_cascades\)/);
assert.match(core, /const result=evaluate\(grid,bet\)/);
assert.match(core, /const nextGrid=collapseGrid\(grid,result\.hits\)/);
assert.match(core, /await animateCascade\(grid,result\.hits,nextGrid,multiplier,cascadeNo,payout\)/);
assert.match(core, /grid=nextGrid/);
assert.match(core, /multiplierIndex=Math\.min\(multiplierIndex\+1,cascadePolicy\.multiplier_ladder\.length-1\)/);
assert.match(core, /helios:cascade/);
assert.match(core, /compute_effect:'NONE'/);

// Spin Energy remains a separate demo-only source. It never auto-wagers and its wins
// stay in the demo-energy reward ledger instead of silently feeding the normal balance.
assert.match(core, /const DEFAULT_SPIN_ENERGY_POLICY = \{/);
assert.match(core, /seconds_per_spin:30/);
assert.match(core, /max_bank:3/);
assert.match(core, /eligible_game_modes:\['gridjack'\]/);
assert.match(core, /reward_ledger:'DEMO_ENERGY_REWARD_ONLY'/);
assert.match(core, /automatic_wager_conversion:false/);
assert.match(core, /auto_play_from_bank:false/);
assert.match(core, /function demoSpinEnergyMeta\(\)/);
assert.match(core, /demo_spin_energy:demoSpinEnergyMeta\(\)/);
assert.match(core, /async function spin\(\{fromAuto=false,source='balance'\}=\{\}\)/);
assert.match(core, /const isEnergy=source==='energy'/);
assert.match(core, /if\(isEnergy\) energyRewardUnits=round2\(energyRewardUnits\+spinWin\); else balance=round2\(balance\+spinWin\)/);
assert.equal(core.includes('computeUnits*'), false);
assert.equal(core.includes('computeUnits *'), false);

// Tactile reel/cascade behavior stays present in the rescued runtime.
assert.match(core, /reel\.classList\.add\('reel-spinning'\)/);
assert.match(core, /reel\.classList\.add\('reel-stop'\)/);
assert.match(core, /pulseMachine\('land'\)/);
assert.match(core, /pulseMachine\('win'\)/);

assert.match(html, /CASCADE x1→x64/);
assert.match(html, /helios\.js\?v=1\.6\.0/);
assert.match(html, /Paid symbols collapse and refill/);

console.log('HELIOS restored cascade + Spin Energy invariants: PASS');
