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

// Restored tactile runtime semantic anchors. Do not pin the discarded hardening refactor API.
assert.match(controller, /const GAME_MODES = \{/);
assert.match(controller, /helios:\{/);
assert.match(controller, /key:'helios'.*name:'HELIOS'/s);
assert.match(controller, /divine:\{/);
assert.match(controller, /key:'divine'.*name:'DIVINE'/s);
assert.match(controller, /gridjack:\{/);
assert.match(controller, /key:'gridjack'.*name:'GRIDJACK'/s);
assert.match(controller, /custom:\{/);
assert.match(controller, /key:'custom'.*name:'CUSTOM'/s);
assert.match(controller, /const DEFAULT_CASCADE_POLICY = \{/);
assert.match(controller, /multiplier_ladder:\[1,4,16,64\]/);
assert.match(controller, /max_cascades:8/);

// Tactile reel stopping remains a fixed column schedule, never outcome-weighted.
assert.match(controller, /const outcome=buildOutcome\(\); const baseStop=780; const step=185;/);
assert.match(controller, /animateReel\(col,column,baseStop\+\(col\*step\)\)/);
assert.match(controller, /reel\.classList\.add\('reel-spinning'\)/);
assert.match(controller, /reel\.classList\.add\('reel-stop'\)/);
assert.match(controller, /pulseMachine\('land'\)/);
assert.doesNotMatch(controller, /(?:finalWins|spinWin|nearMiss|computeActive|routeKey)\s*\?\s*\d+\s*:\s*\d+/);

// Simulated compute remains game-neutral.
assert.match(controller, /game_event_weighting:'FORBIDDEN'/);
assert.match(controller, /game_effect:'NONE'/);
assert.match(controller, /compute_effect:'NONE'/);

// Bounded autoplay and demo Spin Energy current semantics.
assert.match(controller, /spin\(\{fromAuto:true,source:'balance'\}\)/);
assert.match(controller, /const isEnergy=source==='energy'/);
assert.match(controller, /reward_ledger:'DEMO_ENERGY_REWARD_ONLY'/);
assert.match(controller, /real_money_value:false/);
assert.match(controller, /automatic_wager_conversion:false/);
assert.match(controller, /auto_play_from_bank:false/);
assert.match(controller, /if\(isEnergy\) energyRewardUnits=round2\(energyRewardUnits\+spinWin\); else balance=round2\(balance\+spinWin\)/);

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
