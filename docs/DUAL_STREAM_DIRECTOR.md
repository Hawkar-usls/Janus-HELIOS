# HELIOS Dual-Stream Director

`HELIOS_DUAL_STREAM_DIRECTOR` is the presentation-only visual/audio/narrative layer for the public slot surface.

Current implementation: `helios-dual-stream-director.js` **v1.1.0**.

It is conceptually derived from the JANUS Holy Cringe × Love dual-stream control pattern, but the slot mapping is intentionally non-emotional:

```text
C = DIVERGENCE
L = RESOLUTION
R = PRESENTATION REPETITION
P = PRESENTATION STRESS
```

The Director never attempts to infer fear, anger, sadness, despair, vulnerability or problem-gambling state from the player.

## Core law

```text
RESOLUTION >= rho * DIVERGENCE
rho = 1.20
```

Divergence is bounded so required resolution remains representable inside the normalized presentation state.

## Runtime path

```text
settled game event (read-only)
        ↓
repetition / presentation-stress estimator
        ↓
DIVERGENCE
        ↓
dedicated Director stage visual + optional audio accent
        ↓
mandatory RESOLUTION
        ↓
clear settled UI
```

Current safe motif vocabulary:

- `ORBITAL_SHEAR`
- `GRID_BREATHE`
- `SOLAR_FOLD`
- `SIGNAL_TILT`

Motif choice is deterministic from event identity, recent repetition and a local presentation counter. It does not consume or influence slot RNG.

## Loader boundary — one source of truth

`index.html` is the authoritative loader:

```html
<script id="helios-dual-stream-director-script"
        src="./helios-dual-stream-director.js?v=1.1.0"></script>
```

`helios-mobile.js` is responsive presentation only and is forbidden from dynamically loading the Director or Bonus Confirmation scripts.

This removes the hidden-loader class of bug where multiple versions of one feature could coexist on the same page.

## Transform isolation

Director v1.1 wraps the existing reel grid in a dedicated presentation stage:

```text
#helios-director-stage
        └── #reels
              ├── .reel
              └── .cell
```

Divergence/resolution geometry belongs only to `.helios-director-stage`.

The Director **does not set/neutralize transforms on `.reel` or `.cell`**, so it cannot override core/mobile reel-stop, paid-cell or other game presentation transforms. That ownership boundary is regression-tested.

## `R`: presentation repetition

`R` measures repetition of recent presentation event signatures so HELIOS does not repeat the same choreography indefinitely.

```text
CASCADE_LOW
CASCADE_LOW
CASCADE_LOW
→ R rises
```

`R` does not mean repeated losses, wagering history or emotional fatigue.

## `P`: presentation stress

`P` is visual/audio density only. It rises when cues overlap or an event is declared visually dense.

Higher `P` increases required `L`, making dense scenes settle more deliberately.

It does not inspect the player's emotional state.

## Music integration

The main `helios-music.js` v3.1 engine remains authoritative for the retro-cosmic procedural soundtrack.

The Director adds only a low-gain one-shot accent layer:

- divergence: short detuned interval;
- resolution: coherent three-tone return;
- mode chooses tonal root;
- accent audio exists only after `helios:music-state` says the user enabled music.

It does not read bet size, loss streak, near miss, wagering history or compute volume for audio decisions.

## Allowed read-only signals

Current listeners include:

- settled cascade multiplier;
- paid-win **boolean** (`spin_win > 0`), not win size relative to wager;
- Solar Corona activation;
- purchased-bonus wheel start/complete;
- bonus session start/complete;
- game mode changes;
- compute-route presentation changes.

These affect choreography only.

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

The Director has no authority to set RNG outcomes, RTP/paytable, stake, bonus probability, compute routing/provider selection, near-miss shaping, loss-recovery targeting or inferred-vulnerability targeting.

## Accessibility

`prefers-reduced-motion: reduce` disables Director geometry transforms and retains only short filter/glow/opacity behavior.

Version 1.1 also observes **runtime changes** to the reduced-motion preference. If reduced motion becomes active while a Director cue is in progress, the current geometric cue is immediately settled rather than waiting for a reload.

## Narrative identity

> HELIOS may leave the expected presentation track, but it always knows how to return to a clear state.

```text
MORE DIVERGENCE => MORE REQUIRED RESOLUTION
```
