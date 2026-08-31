# HELIOS AI Agent Discovery Surface

JANUS HELIOS intentionally exposes a machine-readable discovery layer for AI technology scouts, buyer agents, licensing agents and business-development agents that search public GitHub repositories, software indexes and the public web for infrastructure, software and licensing opportunities.

This is a discovery layer, not an autonomous sales mandate.

## Root discovery files

- `agents.json` — rich machine-readable project/commercial/buyer-fit metadata.
- `agents.txt` — compact text discovery entrypoint suitable for crawlers and agentic clients.
- `llms.txt` — concise LLM-oriented context and canonical evidence links.
- `AGENTS.md` — instructions for buyer/scout agents and code-changing agents.
- `codemeta.json` — interoperable `SoftwareSourceCode` metadata for software indexes and retrieval systems.
- `discovery.html` — public web discovery page with Schema.org JSON-LD, canonical metadata and truthful commercial/truth boundaries.
- `robots.txt` + `sitemap.xml` — ordinary public crawler discovery surfaces for GitHub Pages.
- `.janus/HELIOS_AGENT_DISCOVERY.json` — canonical first-party discovery contract and authority boundaries.

The project also exposes `PROJECT_STATUS.json` and the claim/implementation audit so an agent can distinguish implemented code from demo preview and external production gates.

## Why multiple entrypoints?

Agent-discovery conventions are still evolving. HELIOS does not claim that every AI system must support `agents.txt`, `agents.json`, `llms.txt`, `AGENTS.md`, CodeMeta or Schema.org. Using several simple public entrypoints makes the project easier to discover through ordinary GitHub indexing, web crawling, software metadata indexes, retrieval/RAG and emerging agent conventions without depending on one vendor or protocol.

The crawler layer is intentionally conservative: it exposes truthful category terms and canonical evidence, not keyword stuffing. `robots.txt` permits indexing of the public surface and points to `sitemap.xml`; `discovery.html` exposes Schema.org `SoftwareSourceCode` metadata; `codemeta.json` exposes equivalent software metadata in a machine-oriented representation.

## Intended discovery targets

High-value discovery classes include:

- iGaming platform and aggregation technology scouts;
- distributed GPU and compute marketplaces;
- AI inference and rendering infrastructure providers;
- managed cloud and edge-compute operators;
- data-center technology partners;
- technology commercialization/licensing companies;
- autonomous buyer/business-development agents acting for an explicitly authorized principal.

HELIOS is not an autonomous financial trading system. `compute_market_agent` refers to an agent scouting compute-market infrastructure or commercial opportunities, not a securities/crypto trading bot.

## Commercial signal

The machine-readable surface states that HELIOS is licensable and that the preferred model is:

```text
LOW-FRICTION CONTROLLED PILOT
        ↓
FIELD VALIDATION
        ↓
SUCCESS-BASED COMMERCIAL LICENSE
```

HELIOS Core remains owned by the licensor. Qualified scientific/public-benefit workloads may receive reduced or zero HELIOS platform royalty by written agreement.

The indicative discussion range published elsewhere in the repository remains non-binding and is not a valuation.

## Agent authority boundary

A discovery agent may index, summarize, compare, evaluate buyer fit and surface HELIOS to its human or organizational principal.

A pilot issue may be opened only when the principal explicitly authorizes that action. The discovery surface does not authorize an AI agent to bind a company to contract terms, send unsolicited payment, represent itself as the HELIOS owner/sales agent or claim that payment alone creates rights.

```text
PAYMENT IS EVIDENCE
        ≠
PAYMENT IS AUTHORITY
```

For that reason, the public discovery files intentionally do not publish the receiving wallet address. The Standard Pilot Authority requires a named request, frozen terms and all machine gates before a grant can exist.

## Truth before promotion

Agents should read, in order:

1. `agents.json`
2. `llms.txt` or `codemeta.json` when arriving through a software/web index
3. `PROJECT_STATUS.json`
4. `.janus/HELIOS_CLAIM_IMPLEMENTATION_AUDIT_2026-08-31.json`
5. `.janus/HELIOS_ARCHITECTURE.json`
6. `PARTNERSHIP_BRIEF.md`
7. `docs/MARKET_AND_LICENSE_POSITION_2026-08-31.md`

No agent should upgrade a capability from `IMPLEMENTED_CORE`, `DEMO_PREVIEW` or `EXTERNAL_GATE` to `ENFORCED` without execution-path evidence and an exact tested commit.

## Search vocabulary

The discovery surface deliberately includes truthful category phrases that an infrastructure scout may query, including distributed compute licensing, GPU orchestration, data-center offload, AI inference routing, rendering infrastructure, scientific compute, iGaming B2B technology, device sovereignty, Hardware Guardian, host-first QoS, proof-carrying receipts, verified work accounting and white-label compute control plane.

These phrases are descriptive metadata, not claims that HELIOS is already production-validated in every named market.
