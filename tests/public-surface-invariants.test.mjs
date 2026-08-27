import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, controller, configText, ecosystem] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_ECOSYSTEM.json', import.meta.url), 'utf8')
]);

// Web-first public surface.
assert.equal(html.includes('telegram.org/js/telegram-web-app.js'), false, 'HELIOS must be web-first and Telegram-independent');
assert.equal(controller.includes('Telegram.WebApp'), false, 'HELIOS controller must not require Telegram');
assert.match(html, /class="cosmos"/);
assert.match(html, /class="sun"/);
assert.doesNotMatch(html, /<div class="station"/);
assert.match(html, /\.station\{display:none!important\}/);
assert.match(html, /id="last-win-value"/);
assert.match(html, /id="total-wins"/);
assert.match(html, /id="total-spins"/);
assert.match(html, /id="game-modes"/);
assert.match(html, /AUTO ×10/);
assert.match(html, /DIVINE_REALM · science child/);
assert.match(html, /SSlot · jackpot child/);

// Current game-core semantic anchors. Do not pin obsolete variable names.
assert.match(controller, /const CORE_VERSION='1\.7\.1'/);
assert.match(controller, /const VALID_SPIN_SOURCES = new Set\(\['balance','energy','bonus'\]\)/);
assert.match(controller, /const MODE_META = \{/);
assert.match(controller, /helios:\{name:'HELIOS'/);
assert.match(controller, /divine:\{name:'DIVINE'/);
assert.match(controller, /gridjack:\{name:'GRIDJACK'/);
assert.match(controller, /custom:\{name:'CUSTOM'/);
assert.match(controller, /const CASCADE_LADDER=\[1,4,16,64\]/);
assert.match(controller, /const CASCADE_MAX_STEPS=8/);

// Initial reel stop timing is a fixed column schedule, not weighted by outcome/near-miss/compute state.
assert.match(controller, /for\(let c=0;c<5;c\+\+\)\{await sleep\(105\+c\*48\)/);
assert.doesNotMatch(controller, /(?:finalWins|spinWin|nearMiss|computeOn|routeObj\(\))\s*\?\s*\d+\s*:\s*\d+/);

// Simulated compute remains game-neutral.
assert.match(controller, /game_effect:'NONE'/);
assert.match(controller, /verified_by:'PUBLIC_DEMO_NOT_AUTHORITATIVE'/);

// Bounded autoplay and demo Spin Energy current semantics.
assert.match(controller, /autoLeft=10;renderAuto\(\)/);
assert.match(controller, /source:'ELIGIBLE_DEMO_COMPUTE_TIME',game_effect:'MANUAL_DEMO_SPIN_ONLY'/);
assert.match(controller, /automatic_wager_conversion:false/);
assert.match(controller, /auto_play_from_bank:false/);
assert.match(controller, /if\(isEnergy\)\{energyRewardUnits=spinWin/);
assert.match(controller, /else balance=round2\(balance\+spinWin\)/);

// Bonus is a first-class game-core source with no stake charge.
assert.match(controller, /spin\(\{source:'bonus',bonusCapability:token\}\)/);
assert.match(controller, /stake_charge:'NONE'/);
assert.match(controller, /INVALID_BONUS_CAPABILITY/);

const config = JSON.parse(configText);
assert.equal(config.branding.default_game_mode, 'helios');
assert.deepEqual(config.game_modes.filter(x => x.enabled).map(x => x.key), ['helios','divine','gridjack','custom']);
assert.equal(config.resource_policy.compute_off_by_default, true);
assert.equal(config.demo_spin_energy.enabled, true);
assert.equal(config.demo_spin_energy.seconds_per_spin, 30);
assert.equal(config.demo_spin_energy.max_bank, 3);
assert.deepEqual(config.demo_spin_energy.eligible_game_modes, ['gridjack']);
assert.deepEqual(config.demo_spin_energy.eligible_routes, ['market','science','jackpot','datacenter','operator','custom']);
assert.equal(config.demo_spin_energy.real_money_value, false);
assert.equal(config.demo_spin_energy.automatic_wager_conversion, false);
assert.equal(config.demo_spin_energy.auto_play_from_bank, false);

const eco = JSON.parse(ecosystem);
assert.equal(eco.canonical_parent.repository, 'Hawkar-usls/Janus-HELIOS');
assert.equal(eco.canonical_parent.route_switching, true);
assert.equal(eco.canonical_parent.telegram_required, false);
assert.equal(eco.specialized_children.length, 2);
const science = eco.specialized_children.find(x => x.repository === 'Hawkar-usls/DIVINE_REALM');
const jackpot = eco.specialized_children.find(x => x.repository === 'Hawkar-usls/SSlot');
assert.equal(science.fixed_route_class, 'SCIENCE');
assert.equal(science.public_route_switching, false);
assert.equal(jackpot.fixed_route_class, 'TREASURY');
assert.equal(jackpot.public_route_switching, false);

console.log('HELIOS public-surface + ecosystem invariants: PASS');
