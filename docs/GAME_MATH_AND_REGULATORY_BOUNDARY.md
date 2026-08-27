# JANUS HELIOS — Game Math & Regulatory Boundary

Status: public capability/evaluation prototype.

This document exists so a buyer, studio, test lab, operator, regulator-facing counsel, or technical reviewer can distinguish what HELIOS currently demonstrates from what would still be required for a real-money certified game.

## 1. Current product classification

The public HELIOS build is **not a certified real-money gambling product**.

Current public boundaries:

- demo/local presentation units only;
- no deposits or withdrawals;
- no real-money wager settlement;
- no certified RTP package;
- no regulator-approved RNG package;
- no jurisdiction-specific game certificate;
- no production account/wallet system;
- no claim that public-demo results represent financial value.

The current game surface exists to demonstrate interaction, game UX, bonus/cascade mechanics, and the independence of the compute-routing layer.

## 2. Current base-game model

Public game core:

```text
5 reels × 3 rows
multiple presentation/game modes
mode-specific fixed paylines
left-to-right exact-symbol matching
3+ matching symbols required on a payline
cascade / tumble behavior
cascade multiplier ladder x1 → x4 → x16 → x64
```

The canonical evaluator matches the same exact symbol from reel 1 onward. A symbol currently labelled or presented as ordinary art is not a WILD substitute unless substitution logic is explicitly implemented and tested.

### No true WILD claim

The current core does **not** implement general WILD substitution. Marketing, paytable, buyer material, and certification submissions must not describe a symbol as WILD until substitution semantics exist in the authoritative game core and are covered by tests/math documentation.

## 3. RNG / stop-timing boundary

Current public design requires:

- symbol/outcome selection independent from compute route or compute activity;
- neutral staggered visual reel stops;
- no outcome-dependent stop delay;
- no loss-streak adaptation;
- no near-miss timing manipulation;
- no player-vulnerability input;
- no compute-volume input to game odds.

The visual animation must not be confused with an authoritative regulated RNG certification.

## 4. Cascades

The public cascade engine:

1. evaluates the settled grid;
2. marks paid matching cells;
3. removes paid cells;
4. collapses survivors;
5. refills new symbols;
6. re-evaluates;
7. advances the disclosed cascade multiplier ladder;
8. terminates on no win or the configured bounded maximum.

Compute state does not change cascade admission, refill, multiplier, or payout.

A production game requires a formal mathematical specification and simulation demonstrating the resulting RTP/volatility distribution for the exact certified symbol/paytable/cascade configuration.

## 5. Natural Solar Corona

The natural Solar Corona feature is a demo identity mechanic triggered in HELIOS mode by the configured settled SUN-symbol condition.

Current demo design:

- uses an eight-ray visual wheel;
- uses disclosed demo multipliers;
- credits a demo-only Solar Bonus Bank;
- has no compute/route authority;
- does not create real-money value.

Production deployment would require the feature to be included in the certified game mathematics, rules, help/paytable, jurisdictional review, and test-lab evidence.

## 6. Purchased Solar Free Spins

The current public product demonstrates:

- explicit tier selection;
- exact displayed demo price;
- explicit purchase consent;
- presentation-only activation wheel;
- disclosed starting spin count;
- disclosed natural and tier retrigger parameters;
- bounded maximum total spins;
- standard game RNG for symbol outcomes;
- no forced wins;
- no forced scatters;
- no near-miss shaping;
- no compute-dependent outcomes.

Higher tiers buy disclosed additional opportunities/budget; they do not secretly alter ordinary symbol odds or guarantee profit.

### Current architecture caveat

At the time this document was introduced, purchased bonus execution still depended on a browser presentation bridge around the canonical balance-source game core. That is a valid capability-demo implementation but is not the preferred production architecture.

The production target is:

```text
GAME CORE SPIN SOURCE
  ├── BALANCE
  ├── ENERGY (demo/non-cash where allowed)
  └── BONUS
```

with the authoritative core itself deciding whether a source charges stake and where winnings settle.

Until that first-class BONUS source is implemented and verified, this issue remains a disclosed engineering gate rather than being hidden behind UI behavior.

## 7. Spin Energy

Spin Energy is currently a **demo-only, non-cash reward primitive**.

Current boundaries include:

- capped bank;
- manual use;
- no automatic conversion into wagering;
- no bank autoplay;
- no real-money value;
- no effect on RNG/RTP/bonus probability.

A production operator must independently determine whether any compute-funded reward may be used in its jurisdiction and under its responsible-gaming/product rules.

## 8. Bonus Buy / Feature Buy regulatory boundary

The existence of a public demo Bonus Buy button does not authorize real-money Feature Buy.

A production Feature Buy may require, depending on jurisdiction/platform:

- feature-specific game-math certification;
- exact purchase price and expected value disclosure;
- responsible-gaming review;
- age/geography restrictions;
- platform/provider approval;
- jurisdictional prohibition or disabling of the feature;
- accounting/wallet integration;
- session and dispute logging.

HELIOS production configuration must be able to disable a feature where it is not permitted.

## 9. Responsible-gaming / welfare boundary

The compute/reward layer must not target or exploit inferred gambling vulnerability.

Forbidden product logic includes using:

- loss streaks;
- near misses;
- bet escalation;
- session distress signals;
- inferred gambling disorder/vulnerability;
- compute contribution volume

to intensify game odds, wager pressure, forced autoplay, personal jackpot weighting, or hidden reward probability.

Retention may come from transparent utility and earned external value, not manipulation of vulnerable users.

## 10. What a certified production package would need

Before real-money deployment, create a frozen exact game-math package containing at minimum:

```text
GAME RULES
SYMBOL SET / WEIGHTS
PAYTABLE
PAYLINES / WAYS
BASE-GAME EVALUATOR
CASCADE RULES
BONUS RULES
RETRIGGER RULES
FEATURE-BUY RULES IF ENABLED
RNG INTERFACE
SOURCE-OF-FUNDS/SPIN-SOURCE RULES
RTP CALCULATION / SIMULATION
VOLATILITY / DISTRIBUTION EVIDENCE
MAX WIN / LIMIT BEHAVIOR
ERROR / INTERRUPT / RECOVERY RULES
RESPONSIBLE-GAMING CONFIGURATION
VERSION / HASH MANIFEST
```

Then submit the exact production artifact to the appropriate independent test/certification process required by the operator and jurisdiction.

## 11. Buyer diligence statement

A buyer should value the current game surface as a demonstrable product/UX and integration architecture, **not** as a pre-certified casino binary.

Neither a repository transfer nor an IP assignment automatically transfers regulator approval, a gambling licence, test-lab certificate, operator licence, or platform approval.

## 12. Truth invariant

```text
DEMO GAME CAPABILITY != CERTIFIED REAL-MONEY GAME

COMPUTE != RNG AUTHORITY
PRESENTATION != SETTLEMENT AUTHORITY
VISUAL WHEEL != HIDDEN ODDS CHANGE
MORE EXPENSIVE TIER != GUARANTEED WIN
```

Any future production claim must be tied to the exact certified snapshot, not inferred from the public demo.
