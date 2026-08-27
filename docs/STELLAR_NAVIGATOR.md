# HELIOS Stellar Navigator v1.1

`helios-stellar-nav.js` replaces the old repeating CSS star tiles with a deterministic moving sky sphere.

The goal is visual depth and navigational continuity, not scientific-planetarium claims.

## Current recovery phase

Version `1.1.0` remains deliberately **PASSIVE BACKGROUND ONLY**. The current `SMOOTH_FLOW_BLACK_HOLE_1` patch changes only background presentation; it does not add gameplay inputs.

```text
AUTONOMOUS SLOW DRIFT
        ↓
STELLAR NAVIGATOR
        ↓
MOVING STAR SPHERE
```

There is currently **no input from SPIN, CASCADE, BONUS, MODE or ROUTE**. This is intentional: after a presentation regression, Stellar was reintroduced as an isolated background shell before any event-reactive motion is allowed back.

The navigator has **no authority over game math, bonus flow or compute scheduling**.

```text
RNG / RTP / PAYTABLE / BET / BONUS ODDS
                │
                │ no read/write path
                ▼
      HELIOS STELLAR NAVIGATOR
                │
                ▼
        CANVAS BACKGROUND ONLY
```

## Sky composition

The active sky deliberately mixes two classes:

1. **Bright real-coordinate anchors** — a small manually curated list of well-known naked-eye stars using rounded RA/Dec/magnitude facts for orientation and recognisable colour/brightness character.
2. **Deterministic synthetic deep field** — a Fibonacci-sphere distribution used only to make the backdrop visually continuous and avoid the previous tiled/clumped CSS pattern.

This means the current HELIOS background is **astronomy-inspired, not a scientific star catalogue**. It must not be sold as a replacement for Stellarium, a navigation instrument, or a precision planetarium.

## Motion

- baseline camera drift is slow and deterministic;
- declination has a small bounded autonomous oscillation;
- there is no warp or event impulse in v1.1;
- no win amount, bet amount, loss history, near-miss state or inferred player vulnerability is read;
- no game-mode or compute-route state is read;
- no gameplay or bonus DOM element is queried or modified.

## Smooth-flow presentation patch

`SMOOTH_FLOW_BLACK_HOLE_1` keeps the exposure fixes from `SMOOTH_FLOW_1` and adds a purely decorative lower black-hole treatment.

The background uses three smoothing layers:

- **fallback crossfade** — the old CSS sky and the Stellar canvas crossfade over roughly `2.4 s` instead of switching rapidly;
- **star alpha damping** — each visible star approaches its target brightness through a long exponential response (`~1.25 s`) rather than visually snapping between levels;
- **edge/depth fades** — stars entering or leaving the projection fade through a smoothstep envelope instead of appearing at full intensity on a viewport boundary.

Bright anchor stars twinkle more slowly and with lower amplitude than the synthetic faint field, so stable visual landmarks do not behave like flashing indicators.

### Background body colour flow

The decorative Sun, lower black-hole body and orbit field never jump directly between colour states. They use long-period, low-amplitude, continuously interpolated `filter` animations with independent durations/phases.

In practice the colour movement is intentionally subtle: only a few degrees of hue rotation plus very small saturation/brightness movement over tens of seconds. The objective is a slow atmospheric colour **flow**, not a visible mode switch or disco effect.

With `prefers-reduced-motion: reduce`, autonomous travel and colour-flow animations are disabled and the bodies remain at their neutral palette.

## Centered event-horizon black hole

The former lower-right decorative `planet-horizon` is now restyled at runtime as a centered lower black-hole presentation:

- the body is horizontally centered beneath the main HELIOS shell;
- its upper arc rises behind the lower information cards so the cards remain readable in front of it;
- a thin cold-white/blue rim represents the visible event-horizon/lensing boundary;
- layered radial highlights preserve the existing mercury-like reflective character near the upper surface;
- the inner body rapidly falls toward near-black to read as a black hole rather than a conventional planet;
- the shell remains `z-index:2` while the black-hole body remains `z-index:1`, so it cannot cover or capture the UI;
- no extra network request, image asset, WebGL dependency, game event, bet, balance, route, RNG or bonus input is introduced.

This is a visual black-hole treatment, not a scientific simulation of general-relativistic ray tracing.

## Fail-closed presentation fallback

The old static CSS star field remains visible until the Stellar canvas completes its first successful frame. Only then does `.cosmos.stellar-active` begin the crossfade.

Therefore a missing/failed Stellar script should degrade to the static background rather than damage the slot.

## Performance envelope

- Canvas 2D, no WebGL requirement;
- target draw cadence: 30 FPS;
- device-pixel-ratio capped at `1.5`;
- synthetic star count scales with viewport area and is bounded;
- rendering pauses when the document is hidden;
- no network fetch, XHR, WebSocket or remote asset dependency;
- `prefers-reduced-motion` removes autonomous travel and leaves a stable sky.

## `wisnc/stellar-map` reference boundary

The repository `wisnc/stellar-map` was reviewed as a **design reference** because it demonstrates an offline sky map with star vectors, brightness by magnitude, spectral colour hints and camera easing.

During the 2026-08-27 review, no repository `LICENSE` file was found. Therefore HELIOS does **not** copy or import its source code, generated star catalogue, constellation data, Messier data, screenshots or other assets.

The HELIOS implementation was written independently in JavaScript from product requirements. The concepts used here — spherical coordinates, perspective projection, apparent-magnitude visual scaling and camera easing — are general astronomical/rendering ideas rather than copied source expression.

## Buyer boundary

A buyer should be able to remove or replace `helios-stellar-nav.js` without changing:

- game RNG;
- reels/tactile presentation;
- paytable/RTP;
- bonus eligibility or Solar Corona flow;
- compute routing;
- provider selection;
- receipt verification;
- desktop Fabric/Agent execution.

That removability is intentional: the Stellar Navigator is a branded background capability, not an authority-bearing subsystem.
