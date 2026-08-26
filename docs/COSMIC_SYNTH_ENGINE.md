# HELIOS Cosmic Synth Engine

## Purpose

`helios-music.js` is a local WebAudio **live generative sequencer** for JANUS HELIOS.

It does **not** play a pre-rendered song and it is no longer just a sparse event-SFX layer. After the user explicitly enables `COSMIC AUDIO`, a 16-step musical transport runs continuously and generates an evolving cosmic arrangement. HELIOS events reshape that arrangement in real time.

```text
16-STEP TRANSPORT
      ↓
SOLAR PULSE + BASS + ARP + PAD + STARFIELD
      ↓
HELIOS EVENT MODULATION
      ↓
WEB AUDIO SYNTH GRAPH
      ↓
LIVE GENERATED MUSIC
```

## NerdMiner_v2 inspiration

Architecture inspiration: `BitMaker-hub/NerdMiner_v2`.

NerdMiner is not a beat maker or music engine. It is an ESP32 miner. The useful design principle is its separation of concurrent responsibilities: monitor, Stratum work, mining workers and a responsive main loop are kept as distinct tasks.

HELIOS generalizes that idea for browser audio:

```text
NerdMiner concept         HELIOS audio analogue
----------------------    ---------------------------------
Monitor task              synth / UI status observer
Stratum task              event intake / state changes
Miner workers             independent musical layers
responsive main loop      slot + router remain independent
```

No NerdMiner source code is copied into HELIOS. The reference project is MIT licensed; the use here is architectural inspiration only.

Reference:
- https://github.com/BitMaker-hub/NerdMiner_v2

## Sequencer architecture

The transport runs in 4/4 with sixteenth-note scheduling and look-ahead timing.

Default continuous layers:

- `SOLAR_PULSE` — synthesized kick/pulse anchor;
- `SUB_BASS` / `ORBITAL_BASS` — low harmonic motion;
- `ARPEGGIATOR` — mode-specific melodic sequence;
- `COSMIC_PAD` — long harmonic field following the progression;
- `STARFIELD_BELLS` — sparse high-frequency spatial accents;
- `COMPUTE_DRONE` — quiet low pulse while compute is ACTIVE;
- `EVENT_FILLS` — temporary phrases injected by HELIOS events.

Default harmonic progression uses modal scale degrees:

```text
0 → 4 → 5 → 3
```

The sequence repeats structurally while note selection, register, event fills and active layers change over time.

## Event inputs

The synth may react to:

- game mode changes;
- manual spin start;
- paid cascade events;
- settled paid win presence;
- Solar Corona bonus;
- demo Spin Energy earned;
- compute route changes;
- compute ACTIVE/OFF state.

These are presentation events only.

## Tonal identities

| HELIOS profile | Tonal identity | Default BPM | Character |
| --- | --- | ---: | --- |
| HELIOS | D Lydian Orbit | 66 | luminous / orbital |
| DIVINE | A Lydian Aether | 60 | airy / radiant |
| GRIDJACK | E Dorian Pulse | 78 | mechanical / treasury pulse |
| CUSTOM | C# Void Minor | 70 | darker builder-space |

All profiles are generated from oscillator voices, envelopes, noise percussion, filtering, stereo placement, delay and synthetic convolution ambience.

## Interaction mapping

```text
SPIN
→ ignition fill enters the running sequencer

CASCADE x1
→ temporary harmonic/arp energy increase

CASCADE x4
→ denser fill + higher register

CASCADE x16
→ extended high-register phrase

CASCADE x64
→ maximum cascade layer / solar-flare register

SOLAR CORONA
→ four-bar climax with widened chord voices and dense upper layer

SPIN ENERGY EARNED
→ high bell triad over the running beat

ROUTE CHANGE
→ navigation tone

COMPUTE ACTIVE
→ low engine pulse joins the arrangement
```

Events modify the **music arrangement**, not the slot outcome.

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

The scheduler uses short look-ahead windows rather than blocking timers. When the page becomes hidden, transport scheduling stops and the master output fades; when the page becomes visible again, the transport resumes from a fresh timing anchor.

No external audio file or streaming audio service is required.

## Public configuration

See `config/helios.public.json` → `procedural_audio`.

A buyer may change tonal roots, scales, motifs, BPM and presentation gain without modifying the slot/router core, subject to the immutable fairness boundary above.
