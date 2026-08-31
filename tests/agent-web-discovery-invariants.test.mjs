import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [robots, sitemap, opportunityText, discoveryHtml, codemetaText] = await Promise.all([
  readFile(new URL('../robots.txt', import.meta.url), 'utf8'),
  readFile(new URL('../sitemap.xml', import.meta.url), 'utf8'),
  readFile(new URL('../opportunity.json', import.meta.url), 'utf8'),
  readFile(new URL('../discovery.html', import.meta.url), 'utf8'),
  readFile(new URL('../codemeta.json', import.meta.url), 'utf8')
]);

const opportunity = JSON.parse(opportunityText);
const codemeta = JSON.parse(codemetaText);

assert.match(robots, /Sitemap: https:\/\/hawkar-usls\.github\.io\/Janus-HELIOS\/sitemap\.xml/);
assert.match(robots, /Allow: \//);
assert.match(robots, /codemeta\.json/);

for (const entry of ['agents.json', 'agents.txt', 'llms.txt', 'opportunity.json', 'codemeta.json', 'discovery.html', 'PROJECT_STATUS.json']) {
  assert.match(sitemap, new RegExp(entry.replace('.', '\\.')));
}

assert.equal(opportunity.schema, 'janus.helios.commercial-opportunity.v1');
assert.equal(opportunity.status, 'OPEN_FOR_QUALIFIED_PILOT_AND_LICENSE_DISCUSSION');
assert.equal(opportunity.what_is_available.qualified_standard_pilot, true);
assert.equal(opportunity.what_is_available.core_ip_sale, false);
assert.equal(opportunity.truth_boundary.production_readiness, 'NOT_ESTABLISHED');
assert.equal(opportunity.truth_boundary.payment_alone_creates_rights, false);
assert.equal(opportunity.commercial_framework.binding_offer, false);
assert.equal(opportunity.commercial_framework.core_ip_retained_by_licensor, true);
assert.equal(opportunity.next_action.requires_explicit_principal_authorization, true);
assert.ok(opportunity.agent_roles.includes('technology_deal_scout'));
assert.ok(opportunity.agent_roles.includes('procurement_agent'));
assert.ok(opportunity.agent_roles.includes('technology_broker_agent'));
assert.ok(opportunity.agent_roles.includes('autonomous_buyer_agent'));
assert.match(opportunity.agent_role_disambiguation, /not an autonomous securities, forex or crypto trading system/i);

assert.equal(codemeta['@type'], 'SoftwareSourceCode');
assert.equal(codemeta.name, 'JANUS HELIOS');
assert.equal(codemeta.version, '1.16.0');
assert.match(codemeta.codeRepository, /github\.com\/Hawkar-usls\/Janus-HELIOS/);
assert.equal(codemeta.applicationCategory, 'Distributed Compute Infrastructure');
assert.ok(codemeta.keywords.includes('AI inference routing'));
assert.ok(codemeta.keywords.includes('data center offload'));
assert.ok(codemeta.keywords.includes('iGaming B2B technology'));
assert.match(codemeta.runtimePlatform, /production provider infrastructure is not established/i);

assert.match(discoveryHtml, /application\/ld\+json/);
assert.match(discoveryHtml, /SoftwareSourceCode/);
assert.match(discoveryHtml, /agents\.json/);
assert.match(discoveryHtml, /opportunity\.json/);
assert.match(discoveryHtml, /codemeta\.json/);
assert.match(discoveryHtml, /Production readiness.*NOT ESTABLISHED/is);
assert.match(discoveryHtml, /PAYMENT IS EVIDENCE, NOT AUTHORITY/i);
assert.match(discoveryHtml, /not.*autonomous securities, forex or crypto trading system/is);

const allDiscovery = `${robots}\n${sitemap}\n${opportunityText}\n${discoveryHtml}\n${codemetaText}`.toLowerCase();
assert.doesNotMatch(allDiscovery, /0x7149081aea54fbef57effeb52a5a966b81cc03a0/);
assert.doesNotMatch(
  allDiscovery,
  /(?:seed[_ -]?phrase|private[_ -]?key|withdrawal[_ -]?api[_ -]?key)\s*[:=]\s*["']?[a-z0-9+\/_=-]{16,}/i
);

console.log('HELIOS web/RAG + technology deal-scout + CodeMeta discovery invariants: PASS');
