# HELIOS Dual-Stream Director

`HELIOS_DUAL_STREAM_DIRECTOR` is the presentation-only visual/audio/narrative layer for the public slot surface.

It is conceptually derived from the JANUS Holy Cringe × Love dual-stream control pattern, but the slot mapping is intentionally non-emotional:

```text
C = DIVERGENCE
L = RESOLUTION
R = PRESENTATION REPETITION
P = PRESENTATION STRESS
```

The director never attempts to infer fear, anger, sadness, despair, vulnerability or problem-gambling state from the player.

## Core law

```text
RESOLUTION >= rho * DIVERGENCE
```

Current public value:

```text
rho = 1.20
```

The implementation caps divergence so that the required resolution always remains representable inside the normalized presentation state.

## Runtime path

```text
settled game event (read-only)
        ↓
repetition / presentation-stress estimator
        ↓
DIVERGENCE
        ↓
procedural visual + optional audio accent
        ↓
mandatory RESOLUTION
        ↓
clear settled UI
```

The current safe motif vocabulary is:

- `ORBITAL_SHEAR`
- `GRID_BREATHE`
- `SOLAR_FOLD`
- `SIGNAL_TILT`

Motif choice is deterministic from event identity, recent repetition and a local presentation event counter. It does not consume or influence the slot RNG.

## `R`: presentation repetition

`R` measures repetition of recent presentation event signatures. It exists to prevent HELIOS from showing the exact same choreography indefinitely.

Examples:

```text
CASCADE_LOW
CASCADE_LOW
CASCADE_LOW
```

raises `R`, which makes the director more likely to select another safe presentation motif.

`R` does **not** mean repeated player losses, wager history or emotional fatigue.

## `P`: presentation stress

`P` is presentation density/stress only. It rises when a new presentation cue overlaps an existing cue or when an event is declared visually dense.

It does not inspect the player's emotional state.

Higher `P` increases required `L`, so a dense scene must settle more deliberately.

## Music integration

The main `helios-music.js` engine remains unchanged and authoritative for the retro-cosmic procedural score.

The director adds only a low-gain procedural one-shot accent layer:

- divergence: short detuned interval;
- resolution: coherent three-tone chord;
- mode selects the tonal root;
- accent audio exists only when `helios:music-state` reports that the user enabled music.

The director does not read bet size, losses, near misses, wagering history or compute volume for audio decisions.

## Allowed read-only presentation signals

Current listeners include:

- settled cascade multiplier;
- paid-win **boolean** (`spin_win > 0`), not wager-relative win profiling;
- Solar Corona activation;
- purchased-bonus wheel start/complete;
- bonus session start/complete;
- game mode changes;
- compute route presentation changes.

These signals affect choreography only.

## Hard authority wall

```text
RNG / PAYTABLE / RTP / BET / BONUS ODDS
                  │
                  │ read-only settled events
                  ▼
        DUAL-STREAM DIRECTOR
                  │
                  ▼
      VISUAL / AUDIO / NARRATIVE ONLY
```

The director has no API for:

- setting RNG outcomes;
- changing RTP/paytable;
- changing stake;
- changing bonus probability;
- changing compute routing or provider selection;
- near-miss shaping;
- loss-streak targeting;
- inferred-vulnerability targeting.

## Accessibility

`prefers-reduced-motion: reduce` removes geometry transforms and keeps only short color/glow/opacity presentation changes. Resolution still occurs.

## Narrative identity

The intended HELIOS signature is:

> HELIOS may leave the expected presentation track, but it always knows how to return to a clear state.

Or compactly:

```text
MORE DIVERGENCE => MORE REQUIRED RESOLUTION
```
