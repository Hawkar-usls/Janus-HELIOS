# HELIOS Stellar Navigator v1.1

`helios-stellar-nav.js` replaces the old repeating CSS star tiles with a deterministic moving sky sphere.

The goal is visual depth and navigational continuity, not scientific-planetarium claims.

## Current recovery phase

Version `1.1.0` remains deliberately **PASSIVE BACKGROUND ONLY**. The current `SMOOTH_FLOW_BLACK_HOLE_DYSON_1` patch changes only background presentation; it does not add gameplay authority.

```text
AUTONOMOUS SLOW DRIFT
        ↓
STELLAR NAVIGATOR
        ↓
MOVING STAR SPHERE
```

The navigator itself still has **no direct input from SPIN, CASCADE, BONUS, MODE or ROUTE**. This remains intentional after the earlier presentation regression.

A separate, removable module — `helios-stellar-bridge.js` v1.0.0 — is allowed to consume a very small set of read-only **presentation** signals and layout geometry. It cannot alter RNG, RTP, paytable, bet, bonus probability, payout, compute routing or provider selection.

```text
GAME / BONUS RESULT (read-only presentation signals)
                    │
                    ▼
        HELIOS STELLAR BRIDGE
          │                 │
          ▼                 ▼
  DYSON VISUAL PULSE   STELLAR CAMERA EASING
          │                 │
          └──── presentation only ────┘

RNG / RTP / PAYTABLE / BET / BONUS ODDS / COMPUTE
                    │
                    └──── no write path ────X
```

## Sky composition

The active sky deliberately mixes two classes:

1. **Bright real-coordinate anchors** — a small manually curated list of well-known naked-eye stars using rounded RA/Dec/magnitude facts for orientation and recognisable colour/brightness character.
2. **Deterministic synthetic deep field** — a Fibonacci-sphere distribution used only to make the backdrop visually continuous and avoid the previous tiled/clumped CSS pattern.

This means the current HELIOS background is **astronomy-inspired, not a scientific star catalogue**. It must not be sold as a replacement for Stellarium, a navigation instrument, or a precision planetarium.

## Motion

Inside the navigator:

- baseline camera drift is slow and deterministic;
- declination has a small bounded autonomous oscillation;
- star brightness is damped instead of stepped;
- no win amount, bet amount, loss history, near-miss state or inferred player vulnerability is read;
- no gameplay or bonus DOM element is queried or modified.

Inside the separate bridge:

- mode changes select one of four bounded camera presentation targets and the Stellar canvas eases between them over roughly `2.8 s`;
- reel presentation classes can nudge the Dyson visual as reels begin/stop;
- cascade events can produce a bounded Dyson rotation/scale pulse;
- a settled paid-win **boolean** can produce a visual pulse, but payout magnitude does not control the animation;
- `prefers-reduced-motion` disables camera flights and event pulses while preserving layout anchoring.

## Smooth-flow presentation patch

`SMOOTH_FLOW_BLACK_HOLE_DYSON_1` keeps the exposure fixes from `SMOOTH_FLOW_1`, the centered lower black-hole treatment, and the decorative Dyson-swarm/lattice sphere.

The background uses three smoothing layers:

- **fallback crossfade** — the old CSS sky and the Stellar canvas crossfade over roughly `2.4 s` instead of switching rapidly;
- **star alpha damping** — each visible star approaches its target brightness through a long exponential response (`~1.25 s`) rather than visually snapping between levels;
- **edge/depth fades** — stars entering or leaving the projection fade through a smoothstep envelope instead of appearing at full intensity on a viewport boundary.

Bright anchor stars twinkle more slowly and with lower amplitude than the synthetic faint field, so stable visual landmarks do not behave like flashing indicators.

### Contrast and mode transitions

The bridge removes the previous fast Director `contrast()`/`saturate()` pumping from the reel-stage wrapper. Director geometry and glow choreography remain available, but exposure is not allowed to jump during cascades or paid-win presentation.

Mode-specific Sun/orbit atmosphere is also deliberately shallow and continuously interpolated over roughly `2.8 s`. The old large instantaneous hue jumps are overridden by low-amplitude mode palettes. The objective is a slow atmospheric transition rather than a dark/grey flash.

### Background body colour flow

The decorative Sun, lower black-hole body, orbit field and Dyson sphere use long-period, low-amplitude colour movement. Their role is ambient visual motion, not a game-state indicator.

With `prefers-reduced-motion: reduce`, autonomous travel and colour-flow animations are disabled or reduced to stable presentation states.

## Centered event-horizon black hole

The former lower-right decorative `planet-horizon` is restyled at runtime as a centered lower black-hole presentation:

- the body is horizontally centered beneath the main HELIOS shell;
- its upper arc rises behind the lower information cards so the cards remain readable in front of it;
- a thin cold-white/blue rim represents the visible event-horizon/lensing boundary;
- layered radial highlights preserve the existing mercury-like reflective character near the upper surface;
- the inner body rapidly falls toward near-black to read as a black hole rather than a conventional planet;
- the shell remains `z-index:2` while the black-hole body remains `z-index:1`, so it cannot cover or capture the UI;
- no extra network request, image asset, WebGL dependency, game event, bet, balance, route, RNG or bonus input is introduced.

**The Stellar bridge has no selector, method or CSS rule for `.planet-horizon`. Its declared black-hole geometry effect is `NONE`.** This intentionally prevents later Dyson/camera work from silently squashing or repositioning the accepted black-hole geometry.

This is a visual black-hole treatment, not a scientific simulation of general-relativistic ray tracing.

## Dyson sphere behind the slot

The central HELIOS area has a Dyson-inspired structure behind the two primary UI columns. The intent is symbolic: the interface appears to sit in front of a large energy-harvesting megastructure without the structure becoming part of game math.

The implementation is closer to a **partial Dyson swarm / lattice sphere** than to an opaque solid shell:

- a warm stellar core sits at the geometric center;
- repeated radial/conic collector bands form a metallic lattice around it;
- two independent elliptical ring paths rotate slowly to suggest orbital collector swarms;
- the navigator retains a `35.5%` viewport anchor only as its no-bridge fallback;
- when `helios-stellar-bridge.js` is active, the sphere is physically anchored from the actual `getBoundingClientRect()` geometry of `#game-panel` and `.router`;
- in the normal two-column layout its X coordinate is exactly `(game.right + router.left) / 2`, i.e. the live midpoint of the gap between both columns;
- its Y coordinate and size derive from the overlapping visible panel geometry, so it follows responsive resizing rather than a guessed screen percentage;
- in the stacked layout it falls back to the visible center of the game panel;
- the sphere stays at `z-index:1`, behind `.shell` at `z-index:2`;
- it uses only native CSS gradients and local JavaScript: no image, WebGL, network request or external asset is added;
- `prefers-reduced-motion` disables event rotation/pulsing and camera flight;
- it does not read bet, balance, wager history, loss streak, near miss, player vulnerability, RNG state or compute-routing authority.

### Dyson presentation reactivity

The bridge can make the sphere feel connected to the slot without allowing it to influence the slot:

- spin start → small rotation/pulse;
- each visual reel stop → another small rotation step;
- cascade → bounded rotation/pulse whose tier is selected only from the already-public cascade multiplier;
- settled paid win → one extra pulse based only on `win > 0`, not on stake or player history;
- mode switch → a larger decorative rotation accompanying the camera flight.

All of those paths are one-way: **game presentation → Dyson visual**. There is no reverse path from Dyson/Stellar into game outcome or compute routing.

The Dyson presentation is science-fiction visual language, not a claim that the page simulates a physically complete Dyson sphere.

## Camera fly-by on mode changes

`helios-stellar-bridge.js` restores the earlier sense of travelling through the stellar field when changing HELIOS / DIVINE / GRIDJACK / CUSTOM.

The bridge does not move reels, cells, the game panel or the router. It transforms only `.helios-stellar-canvas` using bounded translate/scale/rotation targets. This keeps tactile reel transforms isolated and preserves the accepted game/bonus runtime.

The transition lasts roughly `2.8 s` with a smooth cubic-bezier easing. Reduced-motion users receive no camera transform.

## Fail-closed presentation fallback

The old static CSS star field remains visible until the Stellar canvas completes its first successful frame. Only then does `.cosmos.stellar-active` begin the crossfade.

If the Stellar bridge fails or is removed, the navigator and current CSS background still render. If the navigator itself fails, the static fallback remains. Neither failure path should damage the slot or bonus flow.

## Performance envelope

- Canvas 2D for the star sphere plus CSS-only decorative bodies;
- target draw cadence: 30 FPS;
- device-pixel-ratio capped at `1.5`;
- synthetic star count scales with viewport area and is bounded;
- rendering pauses when the document is hidden;
- bridge layout updates are animation-frame coalesced and use `ResizeObserver` when available;
- no network fetch, XHR, WebSocket or remote asset dependency in navigator or bridge;
- `prefers-reduced-motion` removes autonomous travel/event flights and leaves a stable sky.

## `wisnc/stellar-map` reference boundary

The repository `wisnc/stellar-map` was reviewed as a **design reference** because it demonstrates an offline sky map with star vectors, brightness by magnitude, spectral colour hints and camera easing.

During the 2026-08-27 review, no repository `LICENSE` file was found. Therefore HELIOS does **not** copy or import its source code, generated star catalogue, constellation data, Messier data, screenshots or other assets.

The HELIOS implementation was written independently in JavaScript from product requirements. The concepts used here — spherical coordinates, perspective projection, apparent-magnitude visual scaling and camera easing — are general astronomical/rendering ideas rather than copied source expression.

## Buyer boundary

A buyer should be able to remove or replace `helios-stellar-nav.js` and `helios-stellar-bridge.js` without changing:

- game RNG;
- reels/tactile presentation;
- paytable/RTP;
- bonus eligibility or Solar Corona flow;
- compute routing;
- provider selection;
- receipt verification;
- desktop Fabric/Agent execution.

That removability is intentional: Stellar Navigator and its optional UI bridge are branded presentation capabilities, not authority-bearing subsystems.
