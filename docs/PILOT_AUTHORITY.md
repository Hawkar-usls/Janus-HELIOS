# HELIOS Pilot Authority

## Purpose

HELIOS Pilot Authority turns the standard low-friction pilot offer into a fail-closed machine process:

```text
NAMED PILOT REQUEST
      ↓
FROZEN TERMS ACCEPTED
      ↓
LEGAL / SCOPE CERTIFICATIONS
      ↓
UNIQUE EXACT INVOICE
      ↓
PUBLIC ON-CHAIN OBSERVATION
      ↓
CONFIRMATION + REUSE GATES
      ↓
PILOT_ACTIVE · 90 DAYS
```

Core law:

> **PAYMENT IS EVIDENCE, NOT AUTHORITY.**

A random payment to the receiving address grants nothing. The complete request + terms + invoice + verified payment + grant record is required.

## Current state

The subsystem is intentionally committed as:

`ARMED_DISABLED_PENDING_RECEIVING_ADDRESS`

No invoice or pilot grant can be issued until the owner supplies and rechecks the exact receiving address and flips `commerce/HELIOS_PILOT_PAYMENT_POLICY.json` to `enabled: true`.

This protects against accidentally publishing an unverified or stale exchange deposit route.

## Recommended Binance receiving route

For the standard automated pilot, the preferred asset is **USDC**, not BTC and not a fiat USD balance.

Reasoning:

- HELIOS pilot pricing is USD-denominated;
- USDC is designed to track one US dollar, avoiding BTC price volatility between invoice and confirmation;
- native USDC on Base is an ERC-20 asset with six decimals and a stable machine-verifiable contract identity;
- Base is EVM-compatible, making the verification path simple and auditable;
- a fiat USD balance is not an on-chain address and therefore cannot be verified by this blockchain watcher.

The currently frozen primary network is:

```text
Network: Base Mainnet
Chain ID: 8453
Asset: native USDC
Contract: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
Decimals: 6
```

Circle identifies that contract as native USDC on Base:

- https://developers.circle.com/stablecoins/usdc-contract-addresses

Base documents chain ID 8453 and the public bootstrap RPC endpoint:

- https://docs.base.org/base-chain/quickstart/connecting-to-base

Binance's deposit guidance requires the selected deposit network to match the sender's withdrawal network. Network availability can change, so the **current Binance deposit screen controls**:

- https://academy.binance.com/articles/your-guide-to-binance-deposit-withdrawal

### Owner activation procedure

In Binance:

```text
Wallet / Deposit
→ Crypto Deposit
→ USDC
→ Base
→ copy the CURRENT deposit address
```

Before activation, verify in the Binance UI that:

1. `USDC` deposits are currently enabled;
2. the selected network is exactly `Base` / Base Mainnet;
3. the displayed receiving address is copied in full;
4. no tag / memo / payment ID is required for that deposit route; and
5. Binance has not displayed a maintenance or deposit-suspension notice.

Then set only the **public receiving address** in the policy. Never add a seed phrase, private key, Binance password, withdrawal credential or exchange API key.

If Binance does **not** offer USDC on Base for the account at activation time, do not improvise another network in production. Freeze a new policy version and update its chain ID, official token contract, confirmation rule, tests and docs first.

## Why BTC is not the standard automated route

BTC may be accepted later as a separately defined manual or alternate payment method, but it is intentionally not the primary standard-pilot route because:

- the pilot offer is denominated in USD;
- BTC volatility creates an unnecessary valuation question at payment time;
- exact fee matching requires an exchange-rate policy and quote-expiry logic;
- the verification and confirmation model is different from the EVM USDC path.

This is a commercial/operational choice, not a prediction about Bitcoin's future value.

## Standard pilot fee and invoice fingerprint

The standard policy anchor is:

`10,000.000000 USDC`

For payment matching, each GitHub Pilot Request gets a deterministic discount between `0.000001` and `0.999999` USDC.

Example:

```text
standard fee       10000.000000 USDC
invoice fingerprint    0.000043 USDC discount
exact invoice        9999.999957 USDC
```

The difference is deliberately a **discount**, not a surcharge.

This lets the watcher identify a payment without requiring the buyer to expose a wallet private key, use a memo field, or perform a second transaction.

## Request identity and privacy

The public request collects only what the automated licence needs:

- legal entity name;
- authorized representative name or role;
- GitHub grantee identity;
- pilot project description;
- scope selection;
- explicit acceptance/certifications.

It deliberately does not request:

```text
passport / ID document     NO
home address               NO
phone number               NO
wallet private key         NO
seed phrase                NO
Binance password           NO
withdrawal API key         NO
```

A serious partner that needs private procurement/KYC handling should use a separate negotiated enterprise process rather than publishing sensitive material in a GitHub issue.

## What the watcher verifies

`tools/pilot-payment-watch.mjs` is a read-only observer. It:

1. verifies the RPC chain ID;
2. scans only the frozen USDC contract for `Transfer` events to the frozen receiving address;
3. matches the exact invoice amount;
4. checks transaction success;
5. reads the transaction block timestamp;
6. enforces invoice issue/expiry time;
7. waits for the configured confirmation threshold;
8. rejects wrong chain/token/address/amount evidence;
9. checks that the transaction is not already associated with another pilot grant; and
10. emits a repository-authenticated grant record and closes the request only after the complete gate passes.

The watcher cannot withdraw, swap, spend or return funds.

## RPC boundary

The policy currently points to Base's public `https://mainnet.base.org` endpoint as a bootstrap/low-volume observer.

Base explicitly describes its public endpoint as rate-limited and not intended as a production RPC service. Before HELIOS processes meaningful payment volume, configure `HELIOS_PILOT_RPC_URL` with a dedicated/self-hosted or appropriately contracted RPC provider.

The workflow uses the secret only as an RPC URL override. It never requires a wallet signing secret.

## What `PILOT_ACTIVE` means

A standard automated grant is:

```text
TERM                         90 DAYS
EXCLUSIVE                    NO
TRANSFERABLE                 NO
SUBLICENSABLE                NO
INTERNAL EVALUATION          YES
INTERNAL INTEGRATION         YES
CONTROLLED NON-MONEY PILOT   YES
PILOT-ONLY MODIFICATION      YES
REAL-MONEY GAMBLING          NO
PUBLIC PRODUCTION            NO
SOURCE RESALE                NO
HELIOS CORE TRANSFER         NO
AUTOMATIC COMMERCIAL RIGHTS  NO
JANUS I0 INCLUDED            NO
```

The grant gives a partner enough room to build and test a real integration without selling or transferring HELIOS Core.

A production/commercial licence remains a separate agreement.

## GitHub evidence model

For the standard flow, the evidence chain is:

```text
GitHub Pilot Request
+ terms version
+ terms SHA-256
+ invoice JSON
+ public transaction evidence
+ PILOT_ACTIVE grant JSON
+ grant-record SHA-256
```

The grant-record digest protects record integrity but is **not described as a digital signature**.

A later production version may add an actual dedicated signing key / hardware-backed signing service, but no fake signature claim is made today.

## Legal / regulatory boundary

Automation is not legal advice and does not itself implement:

- regulated identity verification;
- sanctions-screening services;
- tax determination;
- gambling certification;
- money-transmitter analysis;
- export-control legal review; or
- production security certification.

The request requires a business/legal compliance self-certification, and the Standard Pilot License makes the grant conditional on applicable law. If law requires additional review, that requirement overrides the automated path.

Most importantly, the standard automated grant never authorizes real-money gambling.

## Files

```text
legal/HELIOS_STANDARD_PILOT_LICENSE_v1.md
commerce/HELIOS_PILOT_PAYMENT_POLICY.json
.janus/HELIOS_PILOT_AUTHORITY.json
src/helios-pilot-authority.js
tools/pilot-payment-watch.mjs
.github/ISSUE_TEMPLATE/helios-pilot-license.yml
.github/workflows/helios-pilot-authority.yml
tests/pilot-authority-invariants.test.mjs
```

## Activation law

```text
NO VERIFIED RECEIVING ADDRESS
        ↓
PILOT AUTHORITY DISABLED

VERIFIED CURRENT ADDRESS
+ EXACT NETWORK
+ NO MEMO REQUIREMENT
+ GREEN EXACT-HEAD INTEGRITY
        ↓
PILOT AUTHORITY MAY BE ENABLED
```

This is intentional. Payment automation should fail closed before it handles money.
