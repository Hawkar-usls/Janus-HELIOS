# HELIOS Cosmic Synth Engine v3

## Purpose

`helios-music.js` is a local WebAudio generative soundtrack engine for JANUS HELIOS.

It does **not** play a pre-rendered song. After the user explicitly enables audio, HELIOS runs a continuous 16-step musical transport. The current game mode defines tonal DNA, the selected compute route changes arrangement character, a session seed creates local variation, and neutral game/system events temporarily reshape tempo, density, register, timbre and fills.

```text
GAME MODE ───────┐
COMPUTE ROUTE ───┤
SESSION SEED ────┤
GAME/UI EVENTS ──┤
                 ▼
        MODE + ROUTE + EVENT REACTOR
                 ↓
      16-STEP LOOKAHEAD TRANSPORT
                 ↓
          WEB AUDIO SYNTH GRAPH
                 ↓
        LIVE GENERATED COSMIC MUSIC
```

## NerdMiner_v2 inspiration

Architecture inspiration: `BitMaker-hub/NerdMiner_v2`.

NerdMiner is not a beat maker or music engine. It is an ESP32 solo miner. The useful design principle is separation of concurrent responsibilities: monitoring, network work intake, mining workers and a responsive main loop are distinct tasks.

HELIOS generalizes that principle for browser audio:

```text
NerdMiner concept         HELIOS audio analogue
----------------------    ---------------------------------------
Monitor task              UI / synth status observer
Stratum work intake       HELIOS event / state intake
Miner workers             oscillator / percussion / pad voices
responsive main loop      slot + router remain independent
```

No NerdMiner source code is copied into HELIOS. The reference project is MIT licensed; the use here is architectural inspiration only.

## Continuous layers

The v3 engine continuously composes with:

- `SOLAR_PULSE`
- `SUB_BASS`
- `ORBITAL_BASS`
- `ARPEGGIATOR`
- `COSMIC_PAD`
- `STARFIELD_BELLS`
- `COMPUTE_DRONE`
- `EVENT_FILLS`

The result is a running composition rather than a collection of one-shot SFX.

## Tonal mode identities

| Game mode | Tonal DNA | Base BPM | Character |
| --- | --- | ---: | --- |
| HELIOS | D Lydian Orbit | 66 | luminous / retro orbital |
| DIVINE | A Lydian Aether | 60 | airy / radiant |
| GRIDJACK | E Dorian Pulse | 78 | mechanical / treasury pulse |
| CUSTOM | C# Void Minor | 70 | darker builder-space |

## Route identities

The selected compute route does not affect game RNG, but it does change the presentation soundtrack.

| Route | Audio identity | Effect examples |
| --- | --- | --- |
| MARKET | Market Exchange | brighter arp, +4 BPM baseline |
| SCIENCE | Science Aether | more starfield, less bass, -2 BPM |
| TREASURY | Treasury Engine | heavy pulse/bass, +8 BPM |
| DC | Data Center Clock | mechanical pulse, +2 BPM |
| OPERATOR | Operator Link | dense low engine, +5 BPM |
| CUSTOM | Custom Void | balanced / buyer-configurable |

This makes `GRIDJACK + TREASURY` musically different from `GRIDJACK + SCIENCE` while preserving the same game mode.

## Session uniqueness

Each browser session receives a random session seed. The sequencer uses it to vary optional kick placements, arpeggio mutations, starfield notes and progression rotation.

This does not make the music cryptographically unique in the strict mathematical sense, but it prevents the public demo from behaving like a fixed looping audio file and makes repeated sessions audibly different.

## Event interaction

Events modify the running composition instead of replacing it.

```text
SPIN
→ ignition fill

CASCADE x1
→ temporary +3 BPM + arrangement boost

CASCADE x4
→ temporary +7 BPM + denser/higher arp

CASCADE x16
→ temporary +12 BPM + extended fill

CASCADE x64
→ temporary +18 BPM + highest cascade layer

SOLAR CORONA
→ multi-bar solar climax +18 BPM

LUCKY CONTRIBUTION
→ celebratory multi-bar layer +12 BPM

DEMO BONUS BUY
→ transition / feature-entry layer +10 BPM

SPIN ENERGY EARNED
→ high bell phrase

ROUTE CHANGE
→ navigation tone + route arrangement switch

COMPUTE ACTIVE
→ low route-specific engine drone joins the music
```

## Lucky Contribution audio

`helios-lucky.js` dispatches `helios:lucky-contribution` when the public demo simulates a significant accepted compute contribution.

The music engine treats this as a presentation event only: it can celebrate the contribution with tempo, fills and harmony, but cannot modify gambling odds or compute settlement.

## Safety / fairness boundary

The synth intentionally does **not** use:

- bet size;
- loss streak;
- near-miss state;
- wagering history;
- player vulnerability or inferred psychology;
- compute volume as a game-odds signal.

```text
MUSIC → RNG       NONE
MUSIC → PAYOUT    NONE
MUSIC → RTP       NONE
MUSIC → ROUTE     NONE
MUSIC → COMPUTE   NONE
```

Music may represent the state of the system. It is not an authority over that system.

## Browser behavior

Audio is OFF by default. The WebAudio graph is created/resumed only after an explicit user interaction with the audio toggle, respecting browser autoplay restrictions.

When the page becomes hidden, the scheduler pauses and the master output fades to silence. No external audio file or streaming audio service is required.

## Public configuration

See `config/helios.public.json` → `procedural_audio`.

A buyer may configure:

- mode roots/scales/motifs/BPM;
- route BPM offsets;
- route rhythmic density;
- bass/arp/starfield density;
- filter bias;
- compute drone strength;
- presentation gain.

The immutable fairness boundary remains unchanged.
