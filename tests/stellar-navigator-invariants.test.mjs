import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source,indexHtml,contract,docs] = await Promise.all([
  readFile(new URL('../helios-stellar-nav.js', import.meta.url),'utf8'),
  readFile(new URL('../index.html', import.meta.url),'utf8'),
  readFile(new URL('../.janus/HELIOS_STELLAR_NAVIGATOR.json', import.meta.url),'utf8'),
  readFile(new URL('../docs/STELLAR_NAVIGATOR.md', import.meta.url),'utf8')
]);

const cfg=JSON.parse(contract);

assert.equal(cfg.version,'1.1.0');
assert.equal(cfg.patch_level,'SMOOTH_FLOW_BLACK_HOLE_1');
assert.equal(cfg.classification,'PRESENTATION_ONLY_ASTRONOMY_INSPIRED_STELLAR_NAVIGATION_BACKGROUND');
assert.equal(cfg.deployment_phase,'PASSIVE_BACKGROUND_ONLY');
assert.equal(cfg.interaction_inputs.length,0);
assert.equal(cfg.authority.rng_effect,'NONE');
assert.equal(cfg.authority.rtp_effect,'NONE');
assert.equal(cfg.authority.payout_effect,'NONE');
assert.equal(cfg.authority.compute_routing_effect,'NONE');
assert.equal(cfg.rendering.network_requests,false);
assert.equal(cfg.rendering.fallback_crossfade_ms,2400);
assert.equal(cfg.rendering.star_brightness_smoothing_ms,1250);
assert.equal(cfg.rendering.background_body_colour_flow,'CONTINUOUS_LONG_PERIOD_FILTER_INTERPOLATION');
assert.equal(cfg.rendering.abrupt_palette_switching,false);
assert.equal(cfg.rendering.lower_body,'CENTERED_EVENT_HORIZON_BLACK_HOLE_PRESENTATION');
assert.equal(cfg.rendering.black_hole_centered,true);
assert.equal(cfg.rendering.event_horizon_ring,true);
assert.equal(cfg.rendering.mercury_reflection,true);
assert.equal(cfg.rendering.black_hole_behind_shell,true);
assert.equal(cfg.external_reference_provenance.source_code_copied,false);
assert.equal(cfg.external_reference_provenance.star_catalog_copied,false);
assert.equal(cfg.external_reference_provenance.images_or_assets_copied,false);

assert.match(source,/const BRIGHT_STAR_ANCHORS/);
assert.match(source,/buildSyntheticSky/);
assert.match(source,/Fibonacci/i);
assert.match(source,/prefers-reduced-motion/);
assert.match(source,/PATCH_LEVEL = 'SMOOTH_FLOW_BLACK_HOLE_1'/);
assert.match(source,/STAR_ALPHA_SMOOTH_MS = 1250/);
assert.match(source,/smoothstep/);
assert.match(source,/edgeFade/);
assert.match(source,/displayAlpha/);
assert.match(source,/transition:opacity 2\.4s/);
assert.match(source,/helios-stellar-sun-flow/);
assert.match(source,/helios-stellar-blackhole-flow/);
assert.match(source,/helios-stellar-orbit-flow/);
assert.match(source,/\.cosmos>\.planet-horizon\{[\s\S]*left:50%!important;[\s\S]*right:auto!important;[\s\S]*translateX\(-50%\)/);
assert.match(source,/\.cosmos>\.planet-horizon::before/);
assert.match(source,/border-top:2px solid rgba\(235,243,255,\.72\)/);
assert.match(source,/\.cosmos>\.planet-horizon::after/);
assert.match(source,/mercury_reflection:true/);
assert.match(source,/event_horizon_visible:true/);
assert.match(source,/central_black_hole:true/);
assert.match(source,/background_body_color_flow:true/);
assert.match(source,/presentation_only:true/);
assert.match(source,/gameplay_input_count:0/);
assert.match(source,/rng_effect:'NONE'/);
assert.match(source,/rtp_effect:'NONE'/);
assert.match(source,/compute_routing_effect:'NONE'/);
assert.match(source,/static CSS star field remains as fallback/i);

assert.doesNotMatch(source,/\bfetch\s*\(/);
assert.doesNotMatch(source,/XMLHttpRequest/);
assert.doesNotMatch(source,/WebSocket/);
assert.doesNotMatch(source,/Math\.random\s*\(/);
assert.doesNotMatch(source,/getElementById\(['"]spin['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]auto-spin['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]bet['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]balance['"]\)/);
assert.doesNotMatch(source,/getElementById\(['"]selected-route['"]\)/);
assert.doesNotMatch(source,/helios:cascade|helios:bonus|helios:director-state/i);
assert.doesNotMatch(source,/loss_streak|near_miss|problem_gambling_label|inferred_vulnerability/i);

assert.match(indexHtml,/id="helios-stellar-nav-script"[^>]+helios-stellar-nav\.js\?v=1\.1\.0/);
assert.match(docs,/PASSIVE BACKGROUND ONLY/i);
assert.match(docs,/SMOOTH_FLOW_BLACK_HOLE_1/);
assert.match(docs,/colour flow/i);
assert.match(docs,/event-horizon black hole/i);
assert.match(docs,/mercury-like reflective character/i);
assert.match(docs,/no repository `LICENSE` file was found/i);
assert.match(docs,/astronomy-inspired, not a scientific star catalogue/i);

console.log('stellar navigator smooth-flow black-hole invariants: PASS');
