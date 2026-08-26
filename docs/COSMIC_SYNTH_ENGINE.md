# HELIOS Cosmic Synth Engine

## Purpose

`helios-music.js` is a local WebAudio procedural soundtrack engine for JANUS HELIOS.

It does **not** play a pre-rendered song. A low-cost musical transport continuously generates a cosmic harmonic bed after the user explicitly enables audio, while HELIOS events add or transform musical phrases.

```text
GAME / UI EVENTS
      ↓
COSMIC EVENT REACTOR
      ↓
HARMONIC PROFILE + TRANSPORT
      ↓
WEB AUDIO SYNTH GRAPH
      ↓
LIVE GENERATED SOUND
```

## NerdMiner_v2 inspiration

Architecture inspiration: `BitMaker-hub/NerdMiner_v2`.

NerdMiner is not a beat maker or music engine. It is an ESP32 miner. The useful design principle is its separation of concurrent responsibilities: monitor, Stratum work, mining workers and a responsive main loop are kept as distinct tasks.

HELIOS generalizes that idea for browser audio:

```text
NerdMiner concept         HELIOS audio analogue
----------------------    -------------------------------
Monitor task              UI / synth status observer
Stratum task              event intake / state changes
Miner workers             procedural note/chord voices
responsive main loop      slot + router remain independent
```

No NerdMiner source code is copied into HELIOS. The reference project is MIT licensed; the use here is architectural inspiration only.

Reference:
- https://github.com/BitMaker-hub/NerdMiner_v2

## Event inputs

The synth may react to:

- game mode changes;
- manual spin start;
- paid cascade events;
- settled paid win presence (not amount-driven intensity);
- Solar Corona bonus;
- demo Spin Energy earned;
- compute route changes;
- compute ACTIVE/OFF state.

These are presentation events only.

## Tonal identities

Default public profiles:

| HELIOS profile | Tonal identity | Default BPM | Character |
| --- | --- | ---: | --- |
| HELIOS | D Lydian Orbit | 66 | luminous / orbital |
| DIVINE | A Lydian Aether | 60 | airy / radiant |
| GRIDJACK | E Dorian Pulse | 78 | mechanical / treasury pulse |
| CUSTOM | C# Void Minor | 70 | darker builder-space |

All profiles are generated from oscillator voices, envelopes, filtering, delay and synthetic convolution ambience.

## Interaction mapping

```text
SPIN
→ short ignition motif

CASCADE x1
→ base harmonic accent

CASCADE x4 / x16 / x64
→ progressively higher register and denser accent

SOLAR CORONA
→ wide luminous four-note corona chord

SPIN ENERGY EARNED
→ high bell triad

ROUTE CHANGE
→ navigation ping

COMPUTE ACTIVE
→ low engine pulse joins the ambient transport
```

The compute-state pulse is an audio visualization only. Compute activity does not modify slot RNG, payout, RTP, cascade probability or bonus probability.

## Safety / fairness boundary

The music engine intentionally does not use:

- bet size;
- loss streak;
- near-miss state;
- wagering history;
- player vulnerability or inferred psychology;
- compute volume as a game-odds signal.

The soundtrack must not become a hidden player-conditioning or outcome-shaping system.

```text
MUSIC → RNG       NONE
MUSIC → PAYOUT    NONE
MUSIC → RTP       NONE
MUSIC → ROUTE     NONE
MUSIC → COMPUTE   NONE
```

## Browser behaviour

Audio is OFF by default. The WebAudio graph is created/resumed only after an explicit user interaction with the audio toggle, respecting browser autoplay restrictions.

When the page becomes hidden, the master output fades to silence. No external audio file or streaming audio service is required.

## Public configuration

See `config/helios.public.json` → `procedural_audio`.

A buyer may change tonal roots, scales, motifs, BPM and presentation gain without modifying the slot/router core, subject to the immutable fairness boundary above.
