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

## Active-candidate state

The standard payment policy is enabled in the activation candidate, but the issuer workflow is hard-restricted to `refs/heads/main`. Therefore this branch cannot issue an invoice or a grant while it is being certified.

The exact enabled candidate must pass both:

```text
HELIOS Integrity
HELIOS Pilot RPC Quorum
```

Only that already-certified SHA may be fast-forwarded to `main`. Once on `main`, every issuer cycle still reruns critical syntax/invariants, secret scan, strict due-diligence preflight and a live two-source RPC smoke before it can process requests.

This removes the race where `enabled:true` could otherwise become effective before its own exact commit is checked.

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

The route was selected after the current Binance deposit UI was checked and Base was not available. Two owner-supplied Binance screens are frozen by SHA-256 in `commerce/HELIOS_PILOT_RECEIVING_ROUTE_EVIDENCE_2026-08-31.json`.

Token symbol alone is not authority. The automatic gate requires:

```text
CHAIN ID = 1
+ OFFICIAL TETHER USDT CONTRACT
+ FROZEN RECEIVING ADDRESS
+ EXACT RAW INVOICE AMOUNT
+ TWO-SOURCE RPC QUORUM
+ SUCCESSFUL RECEIPT
+ 64 CONFIRMATIONS
+ NON-REUSED TRANSACTION
```

Only the public receiving address is stored. HELIOS never requires a seed phrase, private key, Binance password, 2FA code, withdrawal credential or exchange withdrawal API key.

## Confirmation policy

The expanded Binance screen showed trading credit after `6` confirmations and withdrawal unlock after `64`. HELIOS uses the more conservative `64` confirmations for automatic pilot grants.

This is an operational safety threshold, not a claim that Binance defines Ethereum protocol finality.

## Standard pilot fee and invoice fingerprint

The standard policy anchor is `10,000.000000 USDT`.

Each qualifying GitHub Pilot Request receives a deterministic discount between `0.000001` and `0.999999` USDT, making the expected raw ERC-20 transfer amount unique without requiring a memo field.

Example:

```text
standard fee              10000.000000 USDT
invoice fingerprint           0.000043 USDT discount
exact invoice               9999.999957 USDT
```

The fingerprint is a discount, never a surcharge.

## Request identity and privacy

The request collects only the minimum contract identity needed by this standard flow: legal entity, authorized representative, GitHub grantee, pilot description/scope and explicit acceptance/compliance certifications.

It does not request passports, home address, phone, wallet private material, Binance credentials or 2FA. A partner needing private procurement/KYC should use a separately negotiated enterprise process.

## Two-source Ethereum observation

The low-volume bootstrap quorum currently uses:

- `https://ethereum-rpc.publicnode.com`
- `https://eth.drpc.org/`

A previous candidate, `https://public.1rpc.io/eth`, was rejected after live GitHub Actions showed `eth_getLogs` was unavailable. HELIOS failed closed rather than falling back to one source.

PublicNode + dRPC passed live pre-activation smoke on commit `fdde711f5b2831a533629528ac81821dafebd61c`, workflow run `33358927756`.

The watcher cross-checks chain identity, head position, inbound USDT logs, transaction receipt and block identity/time. A single RPC cannot automatically grant a license.

For high-volume commercial use, public endpoints should be replaced or augmented with contracted/self-hosted multi-source infrastructure while preserving quorum logic.

## What the watcher cannot do

```text
WITHDRAW FUNDS        NO
SIGN TRANSACTIONS     NO
BROADCAST PAYMENTS    NO
SWAP ASSETS           NO
RETURN FUNDS          NO
ACCESS BINANCE        NO
```

It observes public Ethereum data only. GitHub authority is limited to the issue workflow required to publish the invoice/grant evidence.

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

## Current truth boundary

`Pilot Authority active` means the narrow standard licensing gate can operate on a certified `main` commit. It does **not** mean:

- a real paid pilot has already occurred;
- HELIOS production compute is validated;
- a casino or compute provider is connected;
- real-money gambling is authorized;
- regulatory/KYC/AML/tax review is complete; or
- HELIOS Core ownership has been transferred.

The first real paid grant and partner-operated field pilot remain evidence gates.

## Activation law

```text
VERIFIED BINANCE ROUTE                PASS
NO MEMO/TAG GATE                      PASS
64-CONFIRMATION POLICY                PASS
TWO-SOURCE RPC                        PASS
MAIN-ONLY ISSUER                      PASS
RUNTIME CRITICAL PREFLIGHT            PASS
PAYMENT POLICY IN CANDIDATE           ENABLED
EXACT ENABLED SHA INTEGRITY            REQUIRED BEFORE MAIN
EXACT ENABLED SHA RPC QUORUM           REQUIRED BEFORE MAIN
```

Only the exact dual-green enabled SHA may be promoted to `main`.
