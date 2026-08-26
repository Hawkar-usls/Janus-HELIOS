import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, controller, configText, ecosystem] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_ECOSYSTEM.json', import.meta.url), 'utf8')
]);

assert.equal(html.includes('telegram.org/js/telegram-web-app.js'), false, 'HELIOS must be web-first and Telegram-independent');
assert.equal(controller.includes('Telegram.WebApp'), false, 'HELIOS controller must not require Telegram');

assert.match(html, /class="cosmos"/);
assert.match(html, /class="sun"/);
assert.match(html, /class="station"/);
assert.match(html, /id="last-win-value"/);
assert.match(html, /id="total-wins"/);
assert.match(html, /id="total-spins"/);
assert.match(html, /id="game-modes"/);
assert.match(html, /AUTO ×10/);
assert.match(html, /DIVINE_REALM · science child/);
assert.match(html, /SSlot · jackpot child/);

assert.match(controller, /const GAME_MODES =/);
assert.match(controller, /helios:/);
assert.match(controller, /divine:/);
assert.match(controller, /gridjack:/);
assert.match(controller, /custom:/);
assert.match(controller, /const baseStop=780;/);
assert.match(controller, /const step=185;/);
assert.match(controller, /game_event_weighting:'FORBIDDEN'/);
assert.match(controller, /game_effect:'NONE'/);
assert.match(controller, /autoRemaining=10;/);

const config = JSON.parse(configText);
assert.equal(config.branding.default_game_mode, 'helios');
assert.deepEqual(config.game_modes.filter(x => x.enabled).map(x => x.key), ['helios','divine','gridjack','custom']);
assert.equal(config.resource_policy.compute_off_by_default, true);

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