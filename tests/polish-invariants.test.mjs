import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, core, polish] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-polish.js', import.meta.url), 'utf8')
]);

assert.match(html, /<script src="\.\/helios\.js\?v=1\.6\.0"><\/script>/);
assert.match(html, /<script src="\.\/helios-polish\.js\?v=1\.5\.2"><\/script>/);
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

// Game modes are allowed to recolour the presentation, but the astronomical scene must interpolate smoothly.
assert.match(html, /@property --mode\{syntax:"<color>"/);
assert.match(html, /--mode-transition:1100ms cubic-bezier\(\.22,\.61,\.36,1\)/);
assert.match(html, /\.cosmos\{[^}]*transition:filter var\(--mode-transition\)/s);
assert.match(html, /\.sun\{[^}]*transition:[^}]*var\(--mode-transition\)/s);
assert.match(html, /\.orbit-field\{[^}]*transition:[^}]*var\(--mode-transition\)/s);
assert.match(html, /\.planet-horizon\{[^}]*transition:[^}]*var\(--mode-transition\)/s);
assert.match(html, /body\[data-game-mode="helios"\]\{--mode:#ffc24b;--mode-soft:#ffc24b20\}/);
assert.match(html, /body\[data-game-mode="gridjack"\]\{--mode:#95ff9a;--mode-soft:#95ff9a22\}/);
assert.match(html, /body\[data-game-mode="divine"\]\{--mode:#d7a7ff;--mode-soft:#d7a7ff22\}/);
assert.match(html, /body\[data-game-mode="custom"\]\{--mode:#80d7ff;--mode-soft:#80d7ff22\}/);
assert.match(html, /body\[data-game-mode="gridjack"\] \.cosmos\{filter:hue-rotate\(82deg\) saturate\(1\.14\) brightness\(\.96\)\}/);
assert.match(html, /body\[data-game-mode="divine"\] \.cosmos\{filter:hue-rotate\(-112deg\) saturate\(1\.12\) brightness\(\.97\)\}/);
assert.match(html, /body\[data-game-mode="custom"\] \.cosmos\{filter:hue-rotate\(154deg\) saturate\(1\.08\) brightness\(\.98\)\}/);
assert.match(html, /@media\(prefers-reduced-motion:reduce\)/);

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

// Rescue core feedback semantics: explicit consent gates compute, route changes are blocked while active, and revoke returns to armed/off state.
assert.match(core, /let computeActive = false/);
assert.match(core, /function startCompute\(\)/);
assert.match(core, /if\(!\$\('consent'\)\.checked\)\{ alert\('Explicit compute consent is required\.'\); return; \}/);
assert.match(core, /computeActive=true/);
assert.match(core, /\$\('compute-state'\)\.textContent='ACTIVE'/);
assert.match(core, /function stopCompute\(\)/);
assert.match(core, /computeActive=false/);
assert.match(core, /\$\('power-off'\)\.disabled=true/);
assert.match(core, /\$\('consent'\)\.checked=false/);
assert.match(core, /game_effect:'NONE'/);
assert.match(core, /automatic_wager_conversion:false/);
assert.match(core, /auto_play_from_bank:false/);

console.log('HELIOS polish + route feedback invariants: PASS');
