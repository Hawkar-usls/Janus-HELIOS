# HELIOS Stellar Navigator v1.1

`helios-stellar-nav.js` replaces the old repeating CSS star tiles with a deterministic moving sky sphere. The goal is visual depth and continuity, not scientific-planetarium claims.

## Current recovery phase

Version `1.1.0` remains deliberately **PASSIVE BACKGROUND ONLY**. The current `SMOOTH_FLOW_BLACK_HOLE_DYSON_1` patch changes background presentation only and has no gameplay, bonus, RNG, RTP, payout or compute-routing authority.

```text
AUTONOMOUS SLOW DRIFT
        ↓
STELLAR NAVIGATOR
        ↓
MOVING STAR SPHERE
```

The navigator itself has no direct input from SPIN, CASCADE, BONUS, MODE or ROUTE.

A separate removable module, `helios-stellar-bridge.js` v1.0.4, now has an even narrower role: **layout geometry + CPU/compute presentation policy only**. It no longer reads game mode, spin state, reel stops, cascade events, paid-win state or bonus events.

```text
GAME MODE / SPIN / CASCADE / WIN / BONUS
                 │
                 └──────────── X  no Stellar/Dyson input

LAYOUT GEOMETRY ───────────────► DYSON POSITION
CPU POLICY % ──────────────────► DYSON SIZE
COMPUTE ACTIVE ────────────────► DYSON AMBIENT ACTIVE/DORMANT STATE

RNG / RTP / PAYTABLE / BET / BONUS ODDS / COMPUTE ROUTING
                 │
                 └──────────── X  no write path
```

## Why bridge v1.0.4 exists

Earlier bridge revisions still coupled presentation to game events. A mode change could interpolate `--mode` / `--mode-soft`, move the Stellar camera through differently coloured star regions, and rotate/scale the large Dyson backdrop. Cascades and a settled paid win could also pulse the Dyson geometry. Even though those paths were presentation-only, their large visual footprint could be perceived as a global colour or brightness change.

Version 1.0.4 removes those causal paths instead of masking them with another CSS override:

- no mode palette interpolation;
- no writes to `--mode` or `--mode-soft`;
- no mode-driven Stellar camera flight;
- no mode observer inside the bridge;
- no reel-start or reel-stop observer;
- no cascade, paid-win or bonus presentation listener;
- no game-event Dyson pulse;
- no reel-field dimming on a paid win.

The UI keeps its static root theme. The living-space effect comes from the navigator's autonomous motion, not from game events.

## Sky composition

The active sky deliberately mixes two classes:

1. **Bright real-coordinate anchors** — a small manually curated list of well-known naked-eye stars using rounded RA/Dec/magnitude facts for orientation and recognisable colour/brightness character.
2. **Deterministic synthetic deep field** — a Fibonacci-sphere distribution used only to make the backdrop visually continuous and avoid the previous tiled/clumped CSS pattern.

The current HELIOS background is **astronomy-inspired, not a scientific star catalogue**. It must not be sold as a replacement for Stellarium, a navigation instrument, or a precision planetarium.

## Motion and brightness

Inside the navigator:

- baseline sky drift is slow and deterministic;
- declination has a small bounded autonomous oscillation;
- star brightness is damped instead of stepped;
- fallback sky and Stellar canvas crossfade over roughly `2.4 s`;
- stars entering or leaving the projection use smooth edge/depth fades;
- decorative-body colour flow is long-period and autonomous;
- no win amount, bet amount, game mode, loss history, near-miss state or inferred player vulnerability is read.

Bright anchor stars twinkle more slowly and with lower amplitude than the synthetic faint field, so stable visual landmarks do not behave like flashing indicators.

### Event exposure boundary

`helios-stellar-bridge.js` v1.0.4 forces the Stellar canvas to remain free of mode-driven transforms and does not create a palette animation. It also neutralizes Director filter/shadow exposure pumping at the presentation boundary and prevents WIN FOCUS from dimming the whole reel field.

A win may still have local game feedback such as tactile reel motion, hit-cell emphasis, a result value, or a small local transform. Those are game UI effects; they do not drive Stellar colour, Stellar camera position, Dyson pose, the Sun, the orbit field or the black-hole geometry.

## Background body colour flow

The decorative Sun, lower black-hole body, orbit field and native Dyson artwork may use long-period, low-amplitude autonomous colour flow defined by the passive presentation layers. Their role is ambient visual motion, not a game-state indicator. Mode switches and wins do not restart or retarget that colour flow.

With `prefers-reduced-motion: reduce`, autonomous travel and colour-flow animations are disabled or reduced to stable presentation states.

## Centered event-horizon black hole

The former lower-right decorative `planet-horizon` is restyled as a centered lower **event-horizon black hole** presentation:

- the body is horizontally centered beneath the main HELIOS shell;
- its upper arc rises behind the lower information cards so the cards remain readable in front of it;
- a thin cold-white/blue rim represents the visible event-horizon/lensing boundary;
- layered radial highlights preserve the existing **mercury-like reflective character** near the upper surface;
- the inner body rapidly falls toward near-black to read as a black hole rather than a conventional planet;
- the shell remains `z-index:2` while the black-hole body remains `z-index:1`;
- the bridge applies only the documented static one-step-lower baseline offset and has no mode/spin/cascade/win/bonus coupling to the black hole.

This is a visual treatment, not a scientific simulation of general-relativistic ray tracing.

## Dyson sphere behind the slot

The central HELIOS area has a **Dyson sphere behind the slot**. The artwork reads visually as a **partial Dyson swarm / lattice sphere** rather than an opaque shell.

Its native navigator artwork provides:

- a warm stellar core;
- repeated radial/conic collector bands;
- independent slow elliptical ring paths;
- a fallback viewport anchor;
- no images, WebGL, network requests or external assets.

When bridge v1.0.4 is active:

- `#game-panel` and `.router` geometry determine the live anchor;
- normal two-column X is `(game.right + router.left) / 2`;
- stacked layout falls back to the game-panel center;
- CPU policy changes presentation size only;
- compute ACTIVE/OFF selects active versus dormant ambient presentation;
- no game mode, spin, reel stop, cascade, win or bonus event can rotate, scale, pulse or recolour the Dyson sphere.

The Dyson sphere remains behind `.shell` and has no gameplay or compute-routing authority.

## Tactile game boundary

The event decoupling intentionally does **not** remove the accepted tactile slot behavior. Reel float, reel stop, machine impact, cascades and the Solar Corona bonus flow remain owned by the game/bonus layers. Stellar and Dyson simply stop reacting to those outcomes.

## Fail-closed presentation fallback

The old static CSS star field remains visible until the Stellar canvas completes its first successful frame. Only then does `.cosmos.stellar-active` begin the crossfade.

If the bridge fails or is removed, the navigator and current CSS background still render. If the navigator itself fails, the static fallback remains. Neither failure path should damage the slot or bonus flow.

## Performance envelope

- Canvas 2D for the star sphere plus CSS-only decorative bodies;
- target draw cadence: 30 FPS;
- device-pixel-ratio capped at `1.5`;
- synthetic star count is bounded;
- rendering pauses when the document is hidden;
- bridge layout updates are animation-frame coalesced and use `ResizeObserver` when available;
- no network fetch, XHR, WebSocket or remote asset dependency in navigator or bridge.

## `wisnc/stellar-map` reference boundary

The repository `wisnc/stellar-map` was reviewed as a **design-study reference only** because it demonstrates general concepts such as an offline sky map, star vectors, magnitude-related brightness, spectral colour hints and camera easing.

During the 2026-08-27 review, **no repository `LICENSE` file was found**. Therefore HELIOS does not copy or import its source code, generated star catalogue, constellation data, Messier data, screenshots or other assets.

The HELIOS implementation was written independently in JavaScript from product requirements. Spherical coordinates, perspective projection, apparent-magnitude visual scaling and camera easing are used as general astronomical/rendering ideas rather than copied source expression.

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

That removability is intentional: Stellar Navigator and the optional bridge are branded presentation capabilities, not authority-bearing subsystems.
