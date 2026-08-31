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
TWO-SOURCE PUBLIC ON-CHAIN OBSERVATION
      ↓
64-CONFIRMATION + REUSE GATES
      ↓
PILOT_ACTIVE · 90 DAYS
```

Core law:

> **PAYMENT IS EVIDENCE, NOT AUTHORITY.**

A random payment to the receiving address grants nothing. The complete request + frozen terms + exact invoice + quorum-verified payment + grant record is required.

## Current state

The Binance-side route is now established, but automatic licensing remains deliberately disabled until the final activating commit itself passes both HELIOS Integrity and the HELIOS Pilot RPC Quorum workflow.

Current pre-activation state:

`ARMED_DISABLED_PENDING_FINAL_ACTIVATION`

No invoice or grant is issued while `commerce/HELIOS_PILOT_PAYMENT_POLICY.json` has `enabled: false`.

## Frozen standard payment route

```text
Network: Ethereum Mainnet (ERC20)
Chain ID: 1
Asset: USDT / USD₮
Contract: 0xdAC17F958D2ee523a2206206994597C13D831ec7
Decimals: 6
Receiving address: 0x7149081aea54fbef57effeb52a5a966b81cc03a0
Memo / Tag / Payment ID: not required by the frozen Binance route
Standard anchor: 10,000.000000 USDT
```

The route was selected after the current Binance deposit UI was checked and Base was not available for the intended route. HELIOS therefore switched policy rather than pretending the earlier USDC/Base path remained usable.

The owner supplied two current Binance deposit screenshots. The evidence record freezes their SHA-256 digests, the displayed USDT/ETH route, the receiving address, the absence of a Memo/Tag/Payment-ID field on the expanded screen, and Binance's displayed confirmation thresholds.

Token symbol alone is **not authority**. The automatic gate requires:

```text
CHAIN ID = 1
+ OFFICIAL TETHER USDT CONTRACT
+ FROZEN RECEIVING ADDRESS
+ EXACT RAW INVOICE AMOUNT
+ RPC QUORUM
+ SUCCESSFUL RECEIPT
+ 64 CONFIRMATIONS
+ NON-REUSED TRANSACTION
```

Only the public receiving address is stored. HELIOS never requires a seed phrase, private key, Binance password, 2FA code, withdrawal credential or exchange withdrawal API key.

## Confirmation policy

The expanded Binance screen showed:

- trading credit after `6` confirmations;
- withdrawal unlock after `64` confirmations.

HELIOS uses the more conservative `64` confirmations for automatic grant issuance. This is an operational safety threshold, not a claim that Binance defines Ethereum protocol finality for HELIOS.

## Standard pilot fee and invoice fingerprint

The standard policy anchor is:

`10,000.000000 USDT`

Each Pilot Request gets a deterministic discount between `0.000001` and `0.999999` USDT so the expected on-chain amount is unique without a memo field.

Example:

```text
standard fee              10000.000000 USDT
invoice fingerprint           0.000043 USDT discount
exact invoice               9999.999957 USDT
```

The fingerprint is a **discount**, never a surcharge.

## Request identity and privacy

The request collects the minimum contract identity needed by the standard automated path:

- legal entity name;
- authorized representative;
- GitHub grantee identity;
- pilot description/scope;
- explicit acceptance and compliance certifications.

It does not request passports, home address, phone, wallet private material, Binance credentials or 2FA.

A partner requiring private procurement/KYC handling should use a separately negotiated enterprise process rather than publish sensitive material in a GitHub issue.

## Two-source Ethereum observation

The low-volume bootstrap quorum currently uses:

- `https://ethereum-rpc.publicnode.com`
- `https://eth.drpc.org/`

A previous candidate (`https://public.1rpc.io/eth`) was rejected after a live GitHub Actions smoke showed that the required `eth_getLogs` method was unavailable. HELIOS failed closed rather than falling back to one source.

PublicNode + dRPC later passed the live pre-activation smoke on commit `fdde711f5b2831a533629528ac81821dafebd61c`, workflow run `33358927756`.

The watcher cross-checks chain identity, head position, inbound USDT logs, transaction receipt and block identity/time. A single RPC cannot automatically grant a license.

For high-volume commercial use, these public endpoints should be replaced or augmented with contracted/self-hosted multi-source infrastructure while preserving quorum logic.

## What the watcher cannot do

The watcher is read-only. It cannot:

```text
WITHDRAW FUNDS        NO
SIGN TRANSACTIONS     NO
BROADCAST PAYMENTS    NO
SWAP ASSETS           NO
RETURN FUNDS          NO
ACCESS BINANCE        NO
```

It only observes public Ethereum evidence and uses the repository's GitHub permission to post an invoice/grant record to the qualifying Pilot Request.

## What `PILOT_ACTIVE` means

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

Production/commercial use requires a separate written agreement.

## Legal / regulatory boundary

The automation is not legal advice and is not itself a KYC/AML, sanctions-screening, tax, gambling-regulatory, money-transmitter, export-control or production-security engine. The request includes compliance self-certifications, and applicable law overrides automation.

Most importantly, the standard automated grant never authorizes real-money gambling.

## Evidence files

```text
legal/HELIOS_STANDARD_PILOT_LICENSE_v1.md
commerce/HELIOS_PILOT_PAYMENT_POLICY.json
commerce/HELIOS_PILOT_RECEIVING_ROUTE_EVIDENCE_2026-08-31.json
commerce/HELIOS_PILOT_RPC_QUORUM_POLICY.md
.janus/HELIOS_PILOT_AUTHORITY.json
src/helios-pilot-authority.js
tools/pilot-payment-watch.mjs
tools/pilot-rpc-smoke.mjs
.github/ISSUE_TEMPLATE/helios-pilot-license.yml
.github/workflows/helios-pilot-authority.yml
.github/workflows/helios-pilot-rpc-smoke.yml
tests/pilot-authority-invariants.test.mjs
```

## Activation law

```text
VERIFIED BINANCE ROUTE           PASS
NO MEMO/TAG GATE                 PASS
64-CONFIRMATION POLICY           PASS
TWO-SOURCE RPC SMOKE             PASS
PAYMENT POLICY ENABLED           PENDING
EXACT ACTIVATING HEAD INTEGRITY  PENDING
EXACT ACTIVATING HEAD RPC QUORUM PENDING
```

Only after the pending gates are green may automatic standard-pilot invoicing/grant issuance become active.
