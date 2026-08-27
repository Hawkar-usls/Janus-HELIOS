import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, confirm, bonus, config] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus-confirm.js', import.meta.url), 'utf8'),
  readFile(new URL('../helios-bonus.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8')
]);
const cfg = JSON.parse(config);
const buy = cfg.demo_bonus_buy;

assert.match(html, /helios-bonus\.js\?v=1\.4\.0/);
assert.match(html, /id="helios-bonus-confirm-script"/);
assert.match(html, /helios-bonus-confirm\.js\?v=2\.3\.0/);
assert.match(confirm, /BONUS_CONFIRM_VERSION = '2\.3\.0'/);
assert.match(confirm, /CHOOSE SOLAR FREE SPINS/);
assert.match(confirm, /TOTAL BONUS COST/);
assert.match(confirm, /CURRENT BET/);
assert.match(confirm, /bonus-tier-card/);
assert.match(confirm, /bonus-confirm-consent/);
assert.match(confirm, /CONFIRM BUY/);
assert.match(confirm, /explicit_consent:true/);
assert.match(confirm, /Nothing is deducted before confirmation/);
assert.match(confirm, /helios:bonus-buy-request/);
assert.match(confirm, /helios:bonus-buy-authorized/);
assert.match(confirm, /animatePurchasedBonusWheel/);
assert.match(confirm, /SOLAR CORONA ACTIVATION/);
assert.match(confirm, /corona-pointer/);
assert.match(confirm, /transform 1\.85s/);
assert.match(confirm, /1440\+angle/);
assert.match(confirm, /helios:bonus-wheel-start/);
assert.match(confirm, /helios:bonus-wheel-complete/);
assert.match(confirm, /visual_wheel_complete:true/);
assert.match(confirm, /seamless_overlay_handoff:true/);
assert.match(confirm, /releasePurchasedBonusOverlay/);
assert.match(confirm, /Keep this exact overlay visible/);
assert.match(confirm, /presentation_only:true/);
assert.match(confirm, /rng_effect:'NONE'/);
assert.match(confirm, /overlay\.hidden=true/);
assert.doesNotMatch(confirm, /queueMicrotask/);
assert.doesNotMatch(confirm, /bypassOnce/);
assert.doesNotMatch(confirm, /btn\.click\(\)/);

// Buyer/config-provided tier metadata must never become executable HTML or selector syntax.
assert.match(confirm, /safeTierId/);
assert.match(confirm, /safeText/);
assert.match(confirm, /replaceChildren/);
assert.match(confirm, /name\.textContent=tier\.name/);
assert.match(confirm, /setResult\(result/);
assert.doesNotMatch(confirm, /btn\.innerHTML=`<b>\$\{tier\.name\}/);
assert.doesNotMatch(confirm, /result\.innerHTML=`\$\{award\}/);
assert.doesNotMatch(confirm, /querySelector\(`\.bonus-tier-card\[data-tier=/);

const reviewPos = confirm.indexOf("helios:bonus-buy-review-confirmed");
const wheelPos = confirm.indexOf('wheelHandoff=await animatePurchasedBonusWheel(detail)');
const authPos = confirm.lastIndexOf("helios:bonus-buy-authorized");
const releasePos = confirm.indexOf('await releasePurchasedBonusOverlay(wheelHandoff)');
assert.ok(reviewPos >= 0 && wheelPos > reviewPos && authPos > wheelPos && releasePos > authPos, 'wheel must hand off the still-visible overlay to the bonus core before release');

const animateStart = confirm.indexOf('async function animatePurchasedBonusWheel');
const animateEnd = confirm.indexOf('async function confirmPurchase');
const animateBody = confirm.slice(animateStart, animateEnd);
assert.equal(animateBody.includes("overlay.classList.remove('show')"), false, 'purchase wheel must not close before core activation handoff');

assert.match(bonus, /BONUS_ENGINE_VERSION='1\.4\.0'/);
assert.match(bonus, /helios:bonus-buy-request/);
assert.match(bonus, /helios:bonus-buy-authorized/);
assert.match(bonus, /PRICE_OR_BET_CHANGED/);
assert.match(bonus, /explicit_confirmation_required/);
assert.match(bonus, /first_class_bonus_core_source:true/);
assert.match(bonus, /stake_refund_bridge:false/);

assert.equal(buy.explicit_confirmation_required, true);
assert.equal(buy.tier_selection_required, true);
assert.equal(buy.real_money_value, false);
assert.equal(buy.production_enabled, false);
assert.equal(Array.isArray(buy.tiers), true);
assert.equal(buy.tiers.length, 3);
assert.deepEqual(buy.tiers.map(x=>x.id), ['standard','radiant','solar_flare']);
assert.deepEqual(buy.tiers.map(x=>x.cost_multiplier_of_demo_bet), [50,100,175]);
assert.deepEqual(buy.tiers.map(x=>x.free_spins_count), [10,12,15]);

console.log('HELIOS Bonus Buy seamless activation + DOM-injection boundary invariants: PASS');
