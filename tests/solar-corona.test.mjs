import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, bonus, config, music] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../helios-music.js', import.meta.url), 'utf8')
]);

const cfg = JSON.parse(config);
const corona = cfg.demo_solar_corona;
const buy = cfg.demo_bonus_buy;

// Rescue snapshot intentionally protects the last visually/user-verified working bonus engine.
assert.match(html, /helios-bonus\.js\?v=1\.3\.0/);
assert.match(bonus, /SOLAR CORONA/);
assert.match(bonus, /SOLAR FREE SPINS/);
assert.match(bonus, /CHOOSE BONUS/);
assert.match(bonus, /helios:bonus-buy-request/);
assert.match(bonus, /helios:bonus-buy-authorized/);
assert.match(bonus, /helios:bonus-buy-start/);
assert.match(bonus, /helios:bonus-session-start/);
assert.match(bonus, /helios:bonus-spin/);
assert.match(bonus, /helios:bonus-session-complete/);
assert.match(bonus, /helios:bonus-buy-complete/);
assert.match(bonus, /production_enabled:false/);
assert.match(bonus, /compute_effect:'NONE'/);

// Natural Solar Corona retains the animated pointer/wheel presentation.
assert.match(bonus, /async function triggerBonus\(symbolCount/);
assert.match(bonus, /pointer\.style\.transition = 'transform 1\.45s cubic-bezier\(\.16,\.82,\.18,1\)'/);
assert.match(bonus, /pointer\.style\.transform = `rotate\(\$\{1080 \+ angle\}deg\)`/);
assert.match(bonus, /navigator\.vibrate\(\[18, 32, 18, 32, 28\]\)/);

// Restored purchased-free-spins bridge: normal tactile spins are reused and their stake is
// presentation-refunded so the bonus keeps the proven reel/cascade runtime intact.
assert.match(bonus, /function waitForSpinComplete\(\)/);
assert.match(bonus, /if\(e\.detail\?\.source !== 'balance'\) return/);
assert.match(bonus, /async function runPurchasedFreeSpins\(cost, tier\)/);
assert.match(bonus, /const done = waitForSpinComplete\(\);/);
assert.match(bonus, /\$\('spin'\)\.click\(\);/);
assert.match(bonus, /displayOffset = round2\(displayOffset - currentBet\(\)\)/);
assert.match(bonus, /renderAdjustedBalance\(\)/);

// Retriggers are bounded by the disclosed tier maximum.
assert.match(bonus, /function possibleRetrigger\(tier, naturalSunCount, totalGranted\)/);
assert.match(bonus, /naturalSunCount >= buyPolicy\.retrigger_count/);
assert.match(bonus, /totalGranted < tier\.max_total_spins/);
assert.match(bonus, /Math\.min\(tier\.retrigger_spins, tier\.max_total_spins - totalGranted - added\)/);
assert.match(bonus, /retrigger_spins_added: retrigger\.added/);

assert.equal(corona.enabled, true);
assert.deepEqual(corona.eligible_game_modes, ['helios']);
assert.equal(corona.trigger_symbol, '☀');
assert.equal(corona.trigger_count, 3);
assert.equal(corona.real_money_value, false);
assert.equal(corona.affects_compute, false);
assert.equal(corona.affects_rng, false);
assert.equal(corona.affects_route, false);
assert.equal(corona.reward_ledger, 'SOLAR_BONUS_BANK');

assert.equal(buy.enabled, true);
assert.deepEqual(buy.eligible_game_modes, ['helios']);
assert.equal(buy.feature, 'SOLAR_CORONA_FREE_SPINS');
assert.equal(buy.retrigger_symbol, '☀');
assert.equal(buy.retrigger_count, 3);
assert.equal(buy.bonus_session_ledger, 'DEMO_SOLAR_FREE_SPINS');
assert.equal(buy.winnings_settle_to_demo_balance, true);
assert.equal(buy.explicit_confirmation_required, true);
assert.equal(buy.tier_selection_required, true);
assert.equal(buy.real_money_value, false);
assert.equal(buy.production_enabled, false);
assert.equal(buy.affects_compute, false);
assert.equal(buy.affects_compute_route, false);

const tiers = buy.tiers;
assert.deepEqual(tiers.map(x=>x.id), ['standard','radiant','solar_flare']);
assert.deepEqual(tiers.map(x=>x.free_spins_count), [10,12,15]);
assert.deepEqual(tiers.map(x=>x.retrigger_spins), [2,2,3]);
assert.deepEqual(tiers.map(x=>x.max_total_spins), [16,20,24]);
assert.deepEqual(tiers.map(x=>x.extra_retrigger_chance), [0,0,0]);

for (const event of ['helios:bonus-session-start','helios:bonus-spin','helios:bonus-session-complete']) {
  assert.match(music, new RegExp(event.replace(':','\\:')));
}
assert.match(music, /bonusSessionActive/);

console.log('HELIOS restored Solar Corona + tiered free-spins invariants: PASS');
