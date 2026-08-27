import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, ux] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-slot-ux.js', import.meta.url), 'utf8')
]);

assert.match(html, /helios-slot-ux\.js\?v=1\.0\.0/);

// Child-slot parity primitives promoted safely into HELIOS presentation.
assert.match(ux, /helios-bet-stepper/);
assert.match(ux, /bet-step-down/);
assert.match(ux, /bet-step-up/);
assert.match(ux, /ⓘ GAME GUIDE/);
assert.match(ux, /PAYTABLE · CURRENT BET/);
assert.match(ux, /WIN FOCUS/);
assert.match(ux, /reels\.win-focus/);

// Bet controls must reuse the canonical hidden select rather than create a second wager authority.
assert.match(ux, /select\.value=options\[next\]\.value/);
assert.match(ux, /dispatchEvent\(new Event\('change'/);

// Guide must expose the current demo boundary and compute/game separation.
assert.match(ux, /Gameplay and compute remain independent/);
assert.match(ux, /do not improve RNG, RTP, paylines, cascades or bonus probability/);
assert.match(ux, /not a certified real-money game math package/);

// This layer is presentation/control ergonomics only: no RNG or payout mutation APIs.
assert.equal(/Math\.random\(|crypto\.getRandomValues|totalWins\s*=|balance\s*=/.test(ux), false);

console.log('HELIOS triad-derived slot UX invariants: PASS');
