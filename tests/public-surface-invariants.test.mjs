import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, controller, ecosystem] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios.js', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_ECOSYSTEM.json', import.meta.url), 'utf8')
]);

assert.equal(html.includes('telegram.org/js/telegram-web-app.js'), false, 'HELIOS must be web-first and Telegram-independent');
assert.equal(controller.includes('Telegram.WebApp'), false, 'HELIOS controller must not require Telegram');
assert.match(html, /WEB-FIRST UNIVERSAL ASSET/);
assert.match(html, /DIVINE_REALM · science child/);
assert.match(html, /SSlot · jackpot child/);
assert.match(controller, /const baseStop=780;/);
assert.match(controller, /const step=185;/);
assert.match(controller, /timing depends only on reel index/);
assert.match(controller, /game_event_weighting:'FORBIDDEN'/);
assert.match(controller, /game_effect:'NONE'/);

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