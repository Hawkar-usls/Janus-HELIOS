import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [confirm, mobile] = await Promise.all([
  readFile(new URL('../helios-bonus-confirm.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-mobile.js', import.meta.url), 'utf8')
]);

assert.match(mobile, /helios-bonus-confirm\.js\?v=1\.0\.0/);
assert.match(confirm, /CONFIRM SOLAR FREE SPINS/);
assert.match(confirm, /TOTAL BONUS COST/);
assert.match(confirm, /CURRENT BET/);
assert.match(confirm, /DEMO PRESENTATION UNITS/);
assert.match(confirm, /bonus-confirm-consent/);
assert.match(confirm, /CONFIRM BUY/);
assert.match(confirm, /explicit_consent:true/);
assert.match(confirm, /Nothing is deducted until you explicitly confirm/);
assert.match(confirm, /e\.stopImmediatePropagation\(\)/);
assert.match(confirm, /if\(!consent\?\.checked\) return/);
assert.match(confirm, /real_money_value:false/);
assert.match(confirm, /Escape/);

console.log('HELIOS Bonus Buy explicit consent invariants: PASS');
