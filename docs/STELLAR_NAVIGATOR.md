# HELIOS Stellar Navigator v1.1

`helios-stellar-nav.js` replaces the old repeating CSS star tiles with a deterministic moving sky sphere.

The goal is visual depth and navigational continuity, not scientific-planetarium claims.

## Current recovery phase

Version `1.1.0` is deliberately **PASSIVE BACKGROUND ONLY**.

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

## Fail-closed presentation fallback

The old static CSS star field remains visible until the Stellar canvas completes its first successful frame. Only then does `.cosmos.stellar-active` fade the fallback out.

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
