# HELIOS Cosmic Synth Engine v3.1

## Purpose

`helios-music.js` is a local WebAudio generative soundtrack engine for JANUS HELIOS. It does **not** play a pre-rendered song. After explicit audio enablement, HELIOS runs a continuous 16-step transport.

```text
GAME MODE ───────────┐
COMPUTE ROUTE ───────┤
SESSION SEED ────────┤
GAME/UI EVENTS ──────┤
BONUS SESSION STATE ─┤
                     ▼
          LIVE GENERATIVE REACTOR
                     ↓
          16-STEP LOOKAHEAD CLOCK
                     ↓
             WEB AUDIO GRAPH
                     ↓
       GENERATED COSMIC SOUNDTRACK
```

## NerdMiner_v2 inspiration

Architecture inspiration: `BitMaker-hub/NerdMiner_v2`.

NerdMiner is not a beat maker or music engine. It is an ESP32 solo miner. The useful design principle is separation of concurrent responsibilities: monitoring, work intake, workers and a responsive main loop remain distinct. HELIOS generalizes that separation into UI/game/router/audio responsibilities. **No NerdMiner source code is copied.**

## Continuous layers

- `SOLAR_PULSE`
- `SUB_BASS`
- `ORBITAL_BASS`
- `ARPEGGIATOR`
- `COSMIC_PAD`
- `STARFIELD_BELLS`
- `COMPUTE_DRONE`
- `EVENT_FILLS`

## Tonal mode identities

| Game mode | Tonal DNA | Base BPM | Character |
| --- | --- | ---: | --- |
| HELIOS | D Lydian Orbit | 66 | luminous / retro orbital |
| DIVINE | A Lydian Aether | 60 | airy / radiant |
| GRIDJACK | E Dorian Pulse | 78 | mechanical / treasury pulse |
| CUSTOM | C# Void Minor | 70 | darker builder-space |

## Route identities

| Route | Audio identity | Effect examples |
| --- | --- | --- |
| MARKET | Market Exchange | brighter arp, +4 BPM baseline |
| SCIENCE | Science Aether | more starfield, less bass, -2 BPM |
| TREASURY | Treasury Engine | heavy pulse/bass, +8 BPM |
| DC | Data Center Clock | mechanical pulse, +2 BPM |
| OPERATOR | Operator Link | dense low engine, +5 BPM |
| CUSTOM | Custom Void | balanced / buyer-configurable |

Route selection changes presentation only, never game RNG.

## Session uniqueness

Each browser session receives a random session seed. It changes optional rhythmic placements, arpeggio mutations, starfield notes and some progression movement. This makes the soundtrack a live sequence rather than a fixed loop, without claiming mathematical uniqueness.

## Event interaction

```text
SPIN             → ignition fill
CASCADE x1       → +3 BPM temporary
CASCADE x4       → +7 BPM temporary
CASCADE x16      → +12 BPM temporary
CASCADE x64      → +18 BPM temporary
SOLAR CORONA     → multi-bar solar climax
LUCKY CONTRIBUTION → celebratory layer
SPIN ENERGY      → high bell phrase
ROUTE CHANGE     → navigation tone + arrangement switch
COMPUTE ACTIVE   → route-specific low drone
```

## Solar Free Spins music state

HELIOS v1.12 adds a true purchased `SOLAR_CORONA_FREE_SPINS` session. The soundtrack receives three dedicated events:

```text
helios:bonus-session-start
helios:bonus-spin
helios:bonus-session-complete
```

During the session:

- the sequencer holds a sustained approximately `+12 BPM` bonus state;
- pulse, bass, arp and starfield density increase;
- the bonus-spin number mutates the motif position;
- a winning bonus spin adds a musical response;
- a high cascade peak increases register/fill intensity;
- a `3+ ☀` retrigger gets its own stronger harmonic/fill event;
- the final session total gets an exit cadence.

The audio engine receives event metadata **after** game results exist. It does not choose, bias or predict the result.

## Safety / fairness boundary

The synth intentionally does not use:

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

Music represents system state; it is not an authority over it.

## Browser behavior

Audio is OFF by default and requires an explicit user gesture. When the page is hidden, scheduling pauses and output fades. No external audio file or streaming service is required.

## Public configuration

See `config/helios.public.json` → `procedural_audio`. Buyers may configure tonal profiles, route arrangement character, rhythmic density, filter bias, drone strength and presentation gain while the fairness boundary remains unchanged.
