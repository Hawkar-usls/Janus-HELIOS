# HELIOS Pilot Authority · Ethereum RPC Quorum

The Standard Pilot Authority never treats a single public RPC response as sufficient payment evidence.

## Frozen read-only sources

For the low-volume standard pilot path, HELIOS uses two independent public Ethereum JSON-RPC endpoints:

- `https://ethereum-rpc.publicnode.com`
- `https://public.1rpc.io/eth`

Both are used for **read-only observation only**. No wallet private key, seed phrase, signing key, withdrawal API key, Binance password, or transaction-broadcast authority is present in HELIOS.

## Fail-closed rule

A payment may progress toward `PILOT_ACTIVE` only when the configured quorum agrees on:

1. Ethereum Mainnet chain identity (`chain_id = 1`);
2. a sufficiently close safe block head;
3. the inbound USDT `Transfer` log to the frozen receiving address;
4. successful transaction receipt status;
5. the receipt block number/hash; and
6. the block timestamp/hash used for invoice-window validation.

If the quorum cannot be obtained, automatic grant issuance stops. A missing or disagreeing RPC response is **not** converted into positive evidence.

```text
ONE RPC SAYS PAID       != PAYMENT VERIFIED
RPC QUORUM AGREES       == PAYMENT EVIDENCE CANDIDATE
PAYMENT EVIDENCE        != LICENSE AUTHORITY
```

The existing constitutional law remains:

> **PAYMENT IS EVIDENCE, NOT AUTHORITY.**

The named request, frozen terms acceptance, exact invoice, exact token/network/address/amount, confirmation threshold, transaction non-reuse gate, and grant record remain independently required.

## Confirmation threshold

The owner-supplied Binance expanded deposit screen for `USDT / Ethereum (ERC20)` showed:

- trading credit after `6` confirmations;
- withdrawal unlock after `64` confirmations.

HELIOS deliberately uses the more conservative `64`-confirmation threshold for automatic pilot grants.

## Production boundary

Public endpoints are appropriate only for the current low-frequency pilot bootstrap. Before high-volume commercial use, replace or augment them with contracted/self-hosted infrastructure and retain multi-source verification. The public endpoints are never granted fund-movement authority.
