import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [
  agentsJsonText,
  agentsTxt,
  llmsTxt,
  agentsMd,
  contractText,
  statusText,
  changeControlText,
  codemetaText,
  robotsTxt,
  sitemapXml,
  discoveryHtml
] = await Promise.all([
  readFile(new URL('../agents.json', import.meta.url), 'utf8'),
  readFile(new URL('../agents.txt', import.meta.url), 'utf8'),
  readFile(new URL('../llms.txt', import.meta.url), 'utf8'),
  readFile(new URL('../AGENTS.md', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_AGENT_DISCOVERY.json', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_STATUS.json', import.meta.url), 'utf8'),
  readFile(new URL('../.janus/HELIOS_REPOSITORY_CHANGE_CONTROL.json', import.meta.url), 'utf8'),
  readFile(new URL('../codemeta.json', import.meta.url), 'utf8'),
  readFile(new URL('../robots.txt', import.meta.url), 'utf8'),
  readFile(new URL('../sitemap.xml', import.meta.url), 'utf8'),
  readFile(new URL('../discovery.html', import.meta.url), 'utf8')
]);

const beacon = JSON.parse(agentsJsonText);
const contract = JSON.parse(contractText);
const status = JSON.parse(statusText);
const changeControl = JSON.parse(changeControlText);
const codemeta = JSON.parse(codemetaText);

assert.equal(beacon.schema, 'janus.helios.agent-discovery.v1');
assert.equal(beacon.version, '1.1.0');
assert.equal(beacon.project.name, 'JANUS HELIOS');
assert.equal(beacon.commercial.availability, 'AVAILABLE_FOR_QUALIFIED_LICENSE_AND_PILOT_DISCUSSION');
assert.equal(beacon.commercial.pilot_authority.status, 'ACTIVE_AWAITING_FIRST_REAL_PAID_GRANT');
assert.equal(beacon.commercial.pilot_authority.payment_alone_creates_rights, false);
assert.equal(beacon.agent_permissions.may_bind_principal_to_contract, false);
assert.equal(beacon.agent_permissions.may_send_unsolicited_payment, false);
assert.equal(beacon.agent_permissions.may_claim_production_readiness, false);
assert.equal(beacon.truth_boundaries.production_readiness, 'NOT_ESTABLISHED');
assert.equal(beacon.web_discovery.status, 'ACTIVE_PUBLIC_CRAWLER_SURFACE');
assert.equal(beacon.web_discovery.schema_org_json_ld, true);
assert.equal(beacon.web_discovery.keyword_stuffing_allowed, false);
assert.ok(beacon.discovery_intents.includes('buyer_agent'));
assert.ok(beacon.discovery_intents.includes('technology_scout'));
assert.ok(beacon.discovery_intents.includes('datacenter_compute_partner_scout'));
assert.ok(beacon.search_terms.includes('AI inference routing'));
assert.ok(beacon.search_terms.includes('data center offload'));
assert.match(beacon.commercial.pilot_authority.issue_template, /helios-pilot-license\.yml/);
assert.match(beacon.project.discovery_page, /discovery\.html$/);
assert.match(beacon.project.codemeta, /codemeta\.json$/);

assert.equal(contract.version, '1.1.0');
assert.equal(contract.status, 'ACTIVE_PUBLIC_DISCOVERY_SURFACE');
assert.equal(contract.commercial_signal.licensable, true);
assert.equal(contract.agent_authority.open_pilot_issue, 'ONLY_WITH_EXPLICIT_PRINCIPAL_AUTHORIZATION');
assert.equal(contract.agent_authority.bind_principal, 'FORBIDDEN');
assert.equal(contract.agent_authority.send_unsolicited_payment, 'FORBIDDEN');
assert.equal(contract.anti_abuse.wallet_address_in_discovery_surface, false);
assert.equal(contract.anti_abuse.autonomous_contract_execution_created_by_this_file, false);
assert.equal(contract.web_discovery_policy.keyword_stuffing, 'FORBIDDEN');
assert.equal(contract.web_discovery_policy.wallet_or_payment_target_promotion, 'FORBIDDEN');
assert.equal(contract.public_entrypoints.codemeta, 'codemeta.json');
assert.equal(contract.public_entrypoints.discovery_page, 'discovery.html');
assert.equal(contract.public_entrypoints.robots, 'robots.txt');
assert.equal(contract.public_entrypoints.sitemap, 'sitemap.xml');
assert.ok(contract.laws.includes('PAYMENT_IS_EVIDENCE_NOT_AUTHORITY'));
assert.ok(contract.laws.includes('GAME_RNG_PERP_COMPUTE'));

assert.match(agentsTxt, /Machine-JSON: .*agents\.json/);
assert.match(agentsTxt, /LLM-Context: .*llms\.txt/);
assert.match(agentsTxt, /Pilot-Request: .*helios-pilot-license\.yml/);
assert.match(agentsTxt, /PAYMENT IS EVIDENCE, NOT AUTHORITY/i);
assert.match(agentsTxt, /production readiness is NOT ESTABLISHED/i);

assert.match(llmsTxt, /Licensable B2B compute control plane/i);
assert.match(llmsTxt, /Standard Pilot Authority is active/i);
assert.match(llmsTxt, /Production readiness is NOT ESTABLISHED/i);
assert.match(llmsTxt, /Do not send unsolicited payment/i);

assert.match(agentsMd, /technology scouts, buyer agents, licensing agents/i);
assert.match(agentsMd, /Do not attempt to bypass/i);
assert.match(agentsMd, /may not:\n\n- bind a principal to a contract/i);
assert.match(agentsMd, /Never add wallet private keys, seed phrases, withdrawal credentials/i);

assert.equal(codemeta['@type'], 'SoftwareSourceCode');
assert.equal(codemeta.name, 'JANUS HELIOS');
assert.equal(codemeta.version, '1.16.0');
assert.match(codemeta.codeRepository, /github\.com\/Hawkar-usls\/Janus-HELIOS/);
assert.ok(codemeta.keywords.includes('AI inference routing'));
assert.ok(codemeta.keywords.includes('data center offload'));
assert.match(codemeta.runtimePlatform, /production provider infrastructure is not established/i);

assert.match(robotsTxt, /^User-agent: \*/m);
assert.match(robotsTxt, /^Allow: \/$/m);
assert.match(robotsTxt, /Sitemap: https:\/\/hawkar-usls\.github\.io\/Janus-HELIOS\/sitemap\.xml/);
assert.doesNotMatch(robotsTxt, /Disallow:\s*\//i);

assert.match(sitemapXml, /<loc>https:\/\/hawkar-usls\.github\.io\/Janus-HELIOS\/discovery\.html<\/loc>/);
assert.match(sitemapXml, /<loc>https:\/\/hawkar-usls\.github\.io\/Janus-HELIOS\/agents\.json<\/loc>/);
assert.match(sitemapXml, /<loc>https:\/\/hawkar-usls\.github\.io\/Janus-HELIOS\/codemeta\.json<\/loc>/);

assert.match(discoveryHtml, /<script type="application\/ld\+json">/i);
assert.match(discoveryHtml, /"@type": "SoftwareSourceCode"/);
assert.match(discoveryHtml, /Licensable B2B Compute Control Plane/i);
assert.match(discoveryHtml, /Production readiness is NOT ESTABLISHED/i);
assert.match(discoveryHtml, /Do not send unsolicited payment/i);
assert.match(discoveryHtml, /agents\.json/);
assert.match(discoveryHtml, /codemeta\.json/);

const lowerDiscovery = `${agentsJsonText}\n${agentsTxt}\n${llmsTxt}\n${agentsMd}\n${contractText}\n${codemetaText}\n${robotsTxt}\n${sitemapXml}\n${discoveryHtml}`.toLowerCase();
assert.doesNotMatch(lowerDiscovery, /0x7149081aea54fbef57effeb52a5a966b81cc03a0/);
assert.doesNotMatch(
  lowerDiscovery,
  /(?:seed[_ -]?phrase|private[_ -]?key|withdrawal[_ -]?api[_ -]?key)\s*[:=]\s*["']?[a-z0-9+\/_=-]{16,}/i
);

assert.equal(status.pilot_authority.maturity, 'IMPLEMENTED_CORE_ACTIVE_AWAITING_FIRST_REAL_PAID_GRANT');
assert.equal(status.production_readiness, 'NOT_ESTABLISHED');

assert.equal(changeControl.status, 'ACTIVE_RULESET_ENFORCED');
assert.equal(changeControl.ruleset.name, 'HELIOS MAIN GUARD');
assert.equal(changeControl.ruleset.enforcement, 'active');
assert.equal(changeControl.ruleset.pull_request_required, true);
assert.equal(changeControl.ruleset.non_fast_forward_forbidden, true);
assert.equal(changeControl.ruleset.strict_required_status_checks_policy, true);
assert.deepEqual(changeControl.ruleset.required_status_checks, ['integrity']);
assert.deepEqual(changeControl.ruleset.bypass_actors, []);
assert.equal(changeControl.ruleset.current_user_can_bypass, 'never');

console.log('HELIOS AI agent + crawler/software-index discovery invariants: PASS');
