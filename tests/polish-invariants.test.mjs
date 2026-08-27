import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, core, polish] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-polish.js', import.meta.url), 'utf8')
]);

assert.match(html, /<script src="\.\/helios\.js\?v=1\.7\.1"><\/script>/);
assert.match(html, /<script src="\.\/helios-polish\.js\?v=[^"]+"><\/script>/);
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
assert.match(polish, /Modes do not select compute routes or alter compute rate/);

assert.match(polish, /function buildBetPicker\(\)/);
assert.match(polish, /helios-native-bet/);
assert.match(polish, /helios-bet-menu/);
assert.match(polish, /helios-bet-option/);
assert.match(polish, /select\.dispatchEvent\(new Event\('change'/);
assert.match(polish, /let lastTotalWins/);
assert.match(polish, /let lastNonZeroWin/);
assert.match(polish, /function currentSpinWin\(\)/);
assert.match(polish, /function persistLastWin\(\)/);
assert.match(polish, /if\(lastNonZeroWin>0\)\s*el\.textContent=lastNonZeroWin\.toFixed\(2\)/);

// Current core feedback semantics: explicit consent gates compute, and the status is rendered from compute authority state.
assert.match(core, /\$\('compute-state'\)\.textContent=computeOn\?'ACTIVE':'OFF'/);
assert.match(core, /async function toggleCompute\(on\)/);
assert.match(core, /if\(on\)\{if\(!\$\('consent'\)\.checked\)return;computeOn=true;/);
assert.match(core, /\$\('power-off'\)\.disabled=!computeOn/);
assert.match(core, /game_effect:'NONE'/);
assert.match(core, /automatic_wager_conversion:false/);
assert.match(core, /auto_play_from_bank:false/);

console.log('HELIOS polish + route feedback invariants: PASS');
