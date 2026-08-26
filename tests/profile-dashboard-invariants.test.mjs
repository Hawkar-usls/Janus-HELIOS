import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [profile, config, html] = await Promise.all([
  readFile(new URL('../helios-profile.js', import.meta.url), 'utf8'),
  readFile(new URL('../config/helios.public.json', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8')
]);

const cfg = JSON.parse(config).profile_dashboard;

assert.equal(cfg.enabled, true);
assert.equal(cfg.storage, 'LOCAL_DEMO_PROFILE_V1');
assert.equal(cfg.offers_mode, 'SIMULATED_REALTIME_MARKET_BOARD');
assert.equal(cfg.production_offers_require_live_provider_api, true);
assert.equal(cfg.production_history_requires_authoritative_receipts, true);
assert.ok(cfg.offers_refresh_seconds >= 5);
for (const section of ['OVERVIEW','WORK_HISTORY','LIVE_OFFERS','NOTIFICATIONS']) {
  assert.ok(cfg.sections.includes(section));
}

assert.match(profile, /janus\.helios\.demo\.profile\.v1/);
assert.match(profile, /COMPUTE RECEIPT HISTORY/);
assert.match(profile, /WHERE MY DEVICE WORKED/);
assert.match(profile, /SIMULATED REAL-TIME OFFER BOARD/);
assert.match(profile, /production profile values/i);
assert.match(profile, /helios:lucky-contribution/);
assert.match(profile, /helios:spin-energy-earned/);
assert.match(profile, /helios:showcase-lucky-contribution/);
assert.match(profile, /localStorage/);
assert.equal(/fetch\(['"]https?:\/\//.test(profile), false);
assert.match(html, /helios-profile\.js\?v=1\.0\.0/);

console.log('HELIOS miner profile dashboard invariants: PASS');
