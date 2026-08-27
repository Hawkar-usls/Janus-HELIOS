# HELIOS Stellar Navigator v1.0

`helios-stellar-nav.js` replaces the old repeating CSS star tiles with a deterministic moving sky sphere.

The goal is visual depth and navigational continuity, not scientific-planetarium claims.

## Presentation model

```text
SPIN / CASCADE / BONUS / MODE / ROUTE
                  ↓
         STELLAR NAVIGATOR
                  ↓
         CAMERA IMPULSE / EASE
                  ↓
       MOVING STAR SPHERE / WARP
```

The navigator has **no authority over game math or compute scheduling**.

```text
RNG / RTP / PAYTABLE / BET / BONUS ODDS
                │
                │ no write path
                ▼
      HELIOS STELLAR NAVIGATOR
                │
                ▼
        CANVAS PRESENTATION ONLY
```

## Sky composition

The active sky deliberately mixes two classes:

1. **Bright real-coordinate anchors** — a small manually curated list of well-known naked-eye stars using rounded RA/Dec/magnitude facts for orientation and recognisable colour/brightness character.
2. **Deterministic synthetic deep field** — a Fibonacci-sphere distribution used only to make the backdrop visually continuous and avoid the previous tiled/clumped CSS pattern.

This means the current HELIOS background is **astronomy-inspired, not a scientific star catalogue**. It must not be sold as a replacement for Stellarium, a navigation instrument, or a precision planetarium.

## Motion

- baseline camera drift is slow and deterministic;
- pressing `SPIN` creates a short presentation-only camera impulse;
- cascades can briefly increase apparent travel energy;
- Bonus/Corona events can create stronger but bounded warp;
- mode changes move the camera toward different deterministic sky regions;
- route changes add small deterministic angular offsets;
- `HELIOS_DUAL_STREAM_DIRECTOR` divergence may add a bounded presentation impulse;
- all motion decays smoothly back to the current mode target.

No win amount, bet amount, loss history, near-miss state or inferred player vulnerability is read by the navigator.

## Performance envelope

- Canvas 2D, no WebGL requirement;
- target draw cadence: 30 FPS;
- device-pixel-ratio capped at `1.5`;
- synthetic star count scales with viewport area and is bounded;
- rendering pauses when the document is hidden;
- no network fetch, XHR, WebSocket or remote asset dependency;
- `prefers-reduced-motion` disables travel/warp motion and leaves a static sky.

## `wisnc/stellar-map` reference boundary

The repository `wisnc/stellar-map` was reviewed as a **design reference** because it demonstrates an offline sky map with star vectors, brightness by magnitude, spectral colour hints and camera easing.

During the 2026-08-27 review, no repository `LICENSE` file was found. Therefore HELIOS does **not** copy or import its source code, generated star catalogue, constellation data, Messier data, screenshots or other assets.

The HELIOS implementation was written independently in JavaScript from product requirements. The concepts used here — spherical coordinates, perspective projection, apparent-magnitude visual scaling and camera easing — are general astronomical/rendering ideas rather than copied source expression.

## Buyer boundary

A buyer should be able to remove or replace `helios-stellar-nav.js` without changing:

- game RNG;
- paytable/RTP;
- bonus eligibility;
- compute routing;
- provider selection;
- receipt verification;
- desktop Fabric/Agent execution.

That removability is intentional: the Stellar Navigator is a branded presentation capability, not an authority-bearing subsystem.
