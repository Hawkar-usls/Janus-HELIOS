# HELIOS Pilot Authority · Ethereum RPC Quorum

The Standard Pilot Authority never treats a single RPC response as sufficient payment evidence.

## Current low-volume quorum

The current read-only Ethereum Mainnet quorum is:

- `https://ethereum-rpc.publicnode.com`
- `https://eth.drpc.org/`

A prior candidate, `https://public.1rpc.io/eth`, was rejected after the live GitHub Actions smoke returned `method not available` for the required `eth_getLogs` call. HELIOS did **not** weaken the quorum to make that test pass.

PublicNode + dRPC subsequently passed the live pre-activation RPC smoke on commit `fdde711f5b2831a533629528ac81821dafebd61c` (workflow run `33358927756`). The smoke verified Ethereum chain identity, live block heads, bytecode presence for the frozen official USDT contract, and `eth_getLogs` support from both sources.

These endpoints are used for **observation only**. No wallet private key, seed phrase, signing key, withdrawal API key, Binance password, 2FA code or transaction-broadcast authority is present in HELIOS.

## Fail-closed rule

A payment may progress toward `PILOT_ACTIVE` only when the configured quorum agrees on the relevant evidence:

1. Ethereum Mainnet identity (`chain_id = 1`);
2. sufficiently close chain heads, using the lower head as the safe observation head;
3. the inbound USDT `Transfer` log to the frozen receiving address;
4. successful transaction receipt status and matching block identity;
5. the block timestamp/hash used for invoice-window validation; and
6. at least the frozen confirmation threshold.

If quorum cannot be obtained, automatic grant issuance stops.

```text
ONE RPC SAYS PAID       != PAYMENT VERIFIED
RPC QUORUM AGREES       == PAYMENT EVIDENCE CANDIDATE
PAYMENT EVIDENCE        != LICENSE AUTHORITY
```

The constitutional law remains:

> **PAYMENT IS EVIDENCE, NOT AUTHORITY.**

A named request, frozen terms acceptance, authority/scope certifications, exact invoice, exact chain/token/address/raw amount, transaction non-reuse and grant record remain independently required.

## Binance route and confirmation evidence

The owner-supplied expanded Binance deposit screen for `USDT / Ethereum (ERC20)` showed the frozen receiving route and no Memo/Tag/Payment-ID field. It also showed:

- trading credit after `6` confirmations;
- withdrawal unlock after `64` confirmations.

HELIOS deliberately uses the more conservative `64`-confirmation threshold for automatic pilot grants.

## Production boundary

The two public endpoints are a low-frequency standard-pilot bootstrap, not a high-volume commercial RPC SLA. Before high-volume use, replace or augment them with contracted/self-hosted multi-source infrastructure while preserving quorum verification.

Neither the current nor a future RPC observation layer receives fund-movement authority.
