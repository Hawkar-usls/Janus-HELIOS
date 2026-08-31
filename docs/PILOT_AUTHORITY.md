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

`ARMED_DISABLED_PENDING_RECEIVING_ADDRESS_AND_RPC`

No invoice or pilot grant can be issued until the owner rechecks the exact Binance receiving route, configures the public receiving address, configures a dedicated Ethereum RPC through `HELIOS_PILOT_RPC_URL`, and flips `commerce/HELIOS_PILOT_PAYMENT_POLICY.json` to `enabled: true` on an exact commit that passes HELIOS Integrity.

This prevents an unverified/stale exchange route or an untrusted default RPC from becoming licensing authority.

## Frozen standard payment route

The current standard route is **USDT on Ethereum Mainnet (ERC20)**, not BTC and not a fiat USD balance.

The route was selected after the current Binance deposit UI was checked and Base was not available for the intended deposit path. HELIOS therefore does not pretend the earlier USDC/Base route is usable.

Frozen identity:

```text
Network: Ethereum Mainnet (ERC20)
Chain ID: 1
Asset: USDT / USD₮
Contract: 0xdAC17F958D2ee523a2206206994597C13D831ec7
Decimals: 6
```

Tether's supported-protocol documentation identifies that contract as USD₮ on Ethereum. Ethereum Mainnet uses chain ID `1`.

The token symbol alone is **not authority**. The automatic gate checks the combination:

```text
CHAIN ID
+ ERC20 CONTRACT
+ RECEIVING ADDRESS
+ EXACT RAW AMOUNT
+ SUCCESSFUL RECEIPT
+ CONFIRMATION THRESHOLD
```

### Owner activation procedure

In Binance:

```text
Wallet / Deposit
→ Crypto Deposit
→ USDT
→ ETH / Ethereum (ERC20)
→ copy the CURRENT deposit address
```

Before activation, verify in the Binance UI that:

1. `USDT` deposits are currently enabled;
2. the selected network is exactly `ETH` / `Ethereum (ERC20)`;
3. the displayed receiving address is copied in full;
4. no tag / memo / payment ID is required; and
5. Binance has not displayed maintenance or deposit-suspension notice.

Only the public `0x...` receiving address belongs in HELIOS. Never add a seed phrase, private key, Binance password, withdrawal credential, 2FA code or exchange withdrawal API key.

If Binance later changes network support, do not silently substitute another chain. Freeze a new payment-policy version with the new chain ID, official token contract, confirmation rule, watcher tests and docs first.

## Why BTC is not the standard route

BTC can be supported later as a separately defined manual/alternate payment method, but it is intentionally not the primary standard-pilot route because the offer is USD-denominated. BTC would add quote timestamp, quote expiry, exchange-rate source and slippage policy to a process that does not need them.

This is an operational choice, not a prediction about Bitcoin's value.

## Standard pilot fee and invoice fingerprint

The standard policy anchor is:

`10,000.000000 USDT`

For payment matching, each GitHub Pilot Request receives a deterministic discount between `0.000001` and `0.999999` USDT.

Example:

```text
standard fee       10000.000000 USDT
invoice fingerprint    0.000043 USDT discount
exact invoice        9999.999957 USDT
```

The difference is a **discount**, never a surcharge. It gives the watcher an invoice fingerprint without requiring a memo or wallet private key.

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
2FA code                   NO
withdrawal API key         NO
```

A partner that needs private procurement/KYC handling should use a separate negotiated enterprise process rather than publishing sensitive material in a GitHub issue.

## What the watcher verifies

`tools/pilot-payment-watch.mjs` is a read-only EVM observer. It:

1. verifies the RPC reports Ethereum Mainnet chain ID `1`;
2. scans only the frozen Tether USDT contract for `Transfer` events to the frozen receiving address;
3. matches the exact raw invoice amount;
4. checks transaction success;
5. reads the transaction block timestamp;
6. enforces invoice issue/expiry time;
7. waits for the configured confirmation threshold;
8. rejects wrong chain/token/address/amount evidence;
9. checks that the transaction is not already associated with another pilot grant; and
10. emits a repository-authenticated grant record only after the complete gate passes.

The watcher cannot withdraw, swap, spend, sign or return funds.

## RPC boundary

Unlike the earlier Base bootstrap policy, the Ethereum policy intentionally commits **no default RPC URL**.

Before enabling Pilot Authority, configure a dedicated or appropriately managed Ethereum endpoint as the GitHub Actions secret/environment value:

`HELIOS_PILOT_RPC_URL`

The watcher checks `eth_chainId` and fails if the endpoint is not Ethereum Mainnet. The RPC credential is not a wallet credential and grants no ability to move funds.

For high-volume or higher-assurance production use, the observation layer should later be upgraded to multi-source/provider redundancy and an explicit Ethereum-finality policy. The current `64`-confirmation threshold is a conservative confirmation gate, not a claim of legal or cryptographic settlement finality.

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

The grant gives a partner room to build and test a real integration without selling or transferring HELIOS Core. Production/commercial use remains a separate written agreement.

## GitHub evidence model

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

## Legal / regulatory boundary

Automation is not legal advice and does not itself implement regulated identity verification, sanctions-screening services, tax determination, gambling certification, money-transmitter analysis, export-control legal review or production security certification.

The request requires a business/legal compliance self-certification, and applicable law overrides automation. Most importantly, the standard automated grant never authorizes real-money gambling.

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
NO VERIFIED USDT/ERC20 ADDRESS
OR NO DEDICATED ETHEREUM RPC
        ↓
PILOT AUTHORITY DISABLED

VERIFIED CURRENT ADDRESS
+ ETHEREUM MAINNET / CHAIN 1
+ OFFICIAL TETHER USDT CONTRACT
+ NO MEMO REQUIREMENT
+ DEDICATED RPC
+ GREEN EXACT-HEAD INTEGRITY
        ↓
PILOT AUTHORITY MAY BE ENABLED
```

Payment automation fails closed before it handles money.
