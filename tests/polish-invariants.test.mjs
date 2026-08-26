import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, core, polish] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-polish.js', import.meta.url), 'utf8')
]);

assert.match(html, /<script src="\.\/helios\.js\?v=1\.4\.0"><\/script>/);
assert.match(html, /<script src="\.\/helios-polish\.js\?v=1\.4\.0"><\/script>/);
assert.equal(polish.includes('Telegram.WebApp'), false);
assert.equal(polish.includes('telegram.org'), false);

assert.match(polish, /LOCAL DEMO ACTIVITY/);
assert.match(polish, /HELIOS MODE MATRIX/);
assert.match(polish, /SOUND OFF/);
assert.match(polish, /win-trace/);
assert.match(polish, /SOLAR FLARE/);
assert.match(polish, /RADIANT WIN/);
assert.match(polish, /PULSE WIN/);
assert.match(polish, /STABLE WIN/);
assert.match(polish, /visual event only/);
assert.match(polish, /DEMO GAME PROFILE ONLY/);
assert.match(polish, /They do not select compute routes/);

assert.match(core, /READY · CONSENT OFF/);
assert.match(core, /ROUTE ARMED/);
assert.match(core, /function updatePowerCTA/);
assert.match(core, /game_event_weighting:'FORBIDDEN'/);
assert.match(core, /game_effect:'NONE'/);
assert.match(core, /automatic_wager_conversion:false/);
assert.match(core, /auto_play_from_bank:false/);

console.log('HELIOS polish + route feedback invariants: PASS');
