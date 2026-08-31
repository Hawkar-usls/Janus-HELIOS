import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {
  createPilotInvoice,
  issuePilotGrant,
  normalizePilotRequest,
  validatePilotPaymentPolicy,
  verifyPilotPaymentEvidence
} from '../src/helios-pilot-authority.js';

const repoRoot = new URL('../', import.meta.url);
const policy = JSON.parse(await readFile(new URL('commerce/HELIOS_PILOT_PAYMENT_POLICY.json', repoRoot), 'utf8'));
const termsText = await readFile(new URL(policy.terms_file, repoRoot), 'utf8');
const termsSha256 = createHash('sha256').update(termsText).digest('hex');

const API = process.env.GITHUB_API_URL || 'https://api.github.com';
const REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const TOKEN = process.env.GITHUB_TOKEN || '';
const TITLE_PREFIX = policy.request_gate?.title_prefix || '[HELIOS PILOT]';
const INVOICE_JSON_OPEN = '<!-- HELIOS_PILOT_INVOICE_JSON';
const INVOICE_JSON_CLOSE = 'HELIOS_PILOT_INVOICE_JSON -->';
const GRANT_MARKER = '<!-- HELIOS_PILOT_GRANT:';
const EXPIRED_MARKER = '<!-- HELIOS_PILOT_INVOICE_EXPIRED -->';
const INVALID_MARKER = '<!-- HELIOS_PILOT_REQUEST_INVALID -->';

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function section(body, heading) {
  const re = new RegExp(`###\\s+${escapeRegExp(heading)}\\s*\\n([\\s\\S]*?)(?=\\n###\\s+|$)`, 'i');
  const match = String(body || '').match(re);
  return match ? match[1].trim() : '';
}

function checked(body, phrase) {
  const normalized = String(body || '').replace(/\r/g, '');
  const re = new RegExp(`- \\[x\\][^\\n]*${escapeRegExp(phrase)}`, 'i');
  return re.test(normalized);
}

export function parsePilotIssueRequest(body) {
  return normalizePilotRequest({
    legal_entity_name: section(body, 'Legal entity name'),
    authorized_representative: section(body, 'Authorized representative'),
    github_grantee: section(body, 'GitHub grantee'),
    pilot_project: section(body, 'Pilot project'),
    requested_scope: section(body, 'Requested scope'),
    acceptance: {
      standard_pilot_license_v1: checked(body, 'I accept `legal/HELIOS_STANDARD_PILOT_LICENSE_v1.md` version 1.0'),
      authorized_to_bind_grantee: checked(body, 'I certify that I am authorized to bind the named grantee'),
      no_real_money_or_production_rights: checked(body, 'does not authorize real-money gambling'),
      legal_and_sanctions_compliance: checked(body, 'will not knowingly be used to evade sanctions'),
      exact_network_and_asset_required: checked(body, 'only the exact token, exact network, exact receiving address and exact invoice amount')
    }
  });
}

async function github(path, { method = 'GET', body } = {}) {
  if (!TOKEN || !REPOSITORY) throw new Error('GITHUB_AUTOMATION_CONTEXT_REQUIRED');
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${TOKEN}`,
      'x-github-api-version': '2022-11-28',
      ...(body ? { 'content-type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) throw new Error(`GITHUB_API_${response.status}:${await response.text()}`);
  if (response.status === 204) return null;
  return response.json();
}

function configuredRpcUrls() {
  const policyUrls = policy.chain_observation?.rpc_urls || [];
  const envMany = String(process.env.HELIOS_PILOT_RPC_URLS || '').split(',').map(x => x.trim()).filter(Boolean);
  const envOne = String(process.env.HELIOS_PILOT_RPC_URL || '').trim();
  return [...new Set([...(envOne ? [envOne] : []), ...envMany, ...policyUrls])];
}

const RPC_URLS = configuredRpcUrls();
const RPC_QUORUM = Number(policy.chain_observation?.rpc_quorum || 0);

async function rpcAt(url, method, params = []) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`PILOT_RPC_HTTP_${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new Error(`PILOT_RPC_ERROR:${payload.error.code}:${payload.error.message}`);
    return payload.result;
  } finally {
    clearTimeout(timer);
  }
}

async function rpcSettled(method, params = [], urls = RPC_URLS) {
  const settled = await Promise.allSettled(urls.map(async url => ({ url, result: await rpcAt(url, method, params) })));
  const ok = settled.filter(x => x.status === 'fulfilled').map(x => x.value);
  if (ok.length < RPC_QUORUM) throw new Error(`RPC_QUORUM_UNAVAILABLE:${method}:${ok.length}/${RPC_QUORUM}`);
  return ok;
}

function toHex(value) {
  return `0x${BigInt(value).toString(16)}`;
}

function recipientTopic(address) {
  return `0x${String(address).toLowerCase().replace(/^0x/, '').padStart(64, '0')}`;
}

function parseRawAmount(data) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(String(data || ''))) throw new Error('INVALID_ERC20_TRANSFER_DATA');
  return BigInt(data).toString();
}

function parseInvoiceFromComment(body) {
  const text = String(body || '');
  const start = text.indexOf(INVOICE_JSON_OPEN);
  const end = text.indexOf(INVOICE_JSON_CLOSE);
  if (start < 0 || end < 0 || end <= start) return null;
  const jsonText = text.slice(start + INVOICE_JSON_OPEN.length, end).trim();
  try { return JSON.parse(jsonText); } catch { return null; }
}

function canonicalLog(log) {
  return JSON.stringify({
    address: String(log?.address || '').toLowerCase(),
    blockHash: String(log?.blockHash || '').toLowerCase(),
    blockNumber: String(log?.blockNumber || '').toLowerCase(),
    transactionHash: String(log?.transactionHash || '').toLowerCase(),
    transactionIndex: String(log?.transactionIndex || '').toLowerCase(),
    logIndex: String(log?.logIndex || '').toLowerCase(),
    data: String(log?.data || '').toLowerCase(),
    topics: (log?.topics || []).map(x => String(x).toLowerCase()),
    removed: log?.removed === true
  });
}

function quorumRepresentative(records, canonicalize, errorCode) {
  const buckets = new Map();
  for (const record of records) {
    const key = canonicalize(record.result);
    const bucket = buckets.get(key) || { count: 0, result: record.result, urls: [] };
    bucket.count += 1;
    bucket.urls.push(record.url);
    buckets.set(key, bucket);
  }
  const winner = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
  if (!winner || winner.count < RPC_QUORUM) throw new Error(`${errorCode}:${winner?.count || 0}/${RPC_QUORUM}`);
  return winner;
}

async function listPilotIssues() {
  const issues = await github(`/repos/${REPOSITORY}/issues?state=open&per_page=100&sort=created&direction=asc`);
  return issues.filter(issue => !issue.pull_request && String(issue.title || '').startsWith(TITLE_PREFIX));
}

async function listComments(issueNumber) {
  return github(`/repos/${REPOSITORY}/issues/${issueNumber}/comments?per_page=100`);
}

async function postComment(issueNumber, body) {
  return github(`/repos/${REPOSITORY}/issues/${issueNumber}/comments`, { method: 'POST', body: { body } });
}

async function closeIssue(issueNumber, stateReason = 'completed') {
  return github(`/repos/${REPOSITORY}/issues/${issueNumber}`, {
    method: 'PATCH',
    body: { state: 'closed', state_reason: stateReason }
  });
}

function invoiceComment(invoice) {
  return `<!-- HELIOS_PILOT_INVOICE:${invoice.invoice_id} -->\n## HELIOS Pilot Authority · invoice issued\n\nThe standard pilot request passed the request/acceptance gate. **Do not change network or asset.**\n\n- Invoice: \`${invoice.invoice_id}\`\n- Network: **${invoice.payment.network_display} · chain ${invoice.payment.chain_id}**\n- Asset: **${invoice.payment.asset}**\n- Token contract: \`${invoice.payment.token_contract}\`\n- Receiving address: \`${invoice.payment.receiving_address}\`\n- Exact amount: **${invoice.payment.exact_amount_asset} ${invoice.payment.asset}**\n- RPC quorum required for grant: **${invoice.payment.rpc_quorum_required} independent sources**\n- Expires: **${invoice.expires_at}**\n- Terms: \`${invoice.terms_file}\`\n- Terms SHA-256: \`${invoice.terms_sha256}\`\n\nThe tiny sub-unit difference from the standard fee is a deterministic **discount** used only as an on-chain invoice fingerprint. It is not a surcharge.\n\n**Wrong network, wrong token, wrong amount, late payment or a random transfer without this invoice does not automatically grant rights.**\n\n${INVOICE_JSON_OPEN}\n${JSON.stringify(invoice)}\n${INVOICE_JSON_CLOSE}`;
}

function invalidComment(message) {
  return `${INVALID_MARKER}\n## HELIOS Pilot Authority · request not invoiceable\n\nThe request is not eligible for automatic invoicing yet: \`${message}\`.\n\nNo payment should be sent. Edit or recreate the request so every required identity, authority, scope and terms-acceptance field is complete.`;
}

function expiredComment(invoice) {
  return `${EXPIRED_MARKER}\n## HELIOS Pilot Authority · invoice expired\n\nInvoice \`${invoice.invoice_id}\` expired at **${invoice.expires_at}** without a matching confirmed payment in its validity window. No automatic pilot grant was issued.\n\nCreate a new Pilot Request for a fresh invoice. A late or unmatched transfer requires manual review and does not create rights by itself.`;
}

function grantComment(grant, grantDigest) {
  return `${GRANT_MARKER}${grant.grant_id} -->\n## HELIOS Pilot Authority · PILOT_ACTIVE\n\nThe request, frozen terms and exact on-chain payment have satisfied the Standard Pilot License grant conditions.\n\n- Grant: \`${grant.grant_id}\`\n- Grantee: **${grant.grantee.legal_entity_name}**\n- GitHub grantee: \`${grant.grantee.github_grantee}\`\n- Effective: **${grant.effective_at}**\n- Expires: **${grant.expires_at}**\n- Payment: **${grant.payment.amount_asset} ${grant.payment.asset}** on **${grant.payment.network}**\n- Payment tx: \`${grant.payment.tx_hash}\`\n- Confirmations at grant: **${grant.payment.confirmations_at_grant}**\n- RPC quorum: **${grant.payment.rpc_source_count} sources**\n- Grant-record SHA-256: \`${grantDigest}\`\n\nThis is a **90-day standard controlled non-money pilot grant**. It is non-exclusive, non-transferable and non-sublicensable. It does not transfer HELIOS Core, authorize real-money gambling or create public-production/commercial rights.\n\nA successful pilot requires a separate written agreement for production/commercial use.\n\n\`PAYMENT IS EVIDENCE, NOT AUTHORITY\`\n\n<!-- HELIOS_PILOT_GRANT_JSON\n${JSON.stringify({ ...grant, grant_record_sha256: grantDigest })}\nHELIOS_PILOT_GRANT_JSON -->`;
}

async function getRpcQuorumHead() {
  if (RPC_URLS.length < 2 || RPC_QUORUM < 2 || RPC_QUORUM > RPC_URLS.length) throw new Error('RPC_QUORUM_CONFIGURATION_INVALID');
  const chainRecords = await rpcSettled('eth_chainId');
  const expected = String(policy.chain_observation.expected_chain_id_hex).toLowerCase();
  const validChainUrls = chainRecords.filter(x => String(x.result).toLowerCase() === expected).map(x => x.url);
  if (validChainUrls.length < RPC_QUORUM) throw new Error(`RPC_CHAIN_ID_QUORUM_MISMATCH:${validChainUrls.length}/${RPC_QUORUM}`);

  const headRecords = await rpcSettled('eth_blockNumber', [], validChainUrls);
  const heads = headRecords.map(x => ({ url: x.url, blockNumber: Number(BigInt(x.result)) }));
  const safeHead = Math.min(...heads.map(x => x.blockNumber));
  const spread = Math.max(...heads.map(x => x.blockNumber)) - safeHead;
  const maxSpread = Number(policy.chain_observation.max_head_spread_blocks ?? 8);
  if (spread > maxSpread) throw new Error(`RPC_HEAD_SPREAD_TOO_LARGE:${spread}`);
  return { safeHead, urls: heads.map(x => x.url), sourceCount: heads.length, spread };
}

async function getRecentPaymentLogs(latestBlock, urls) {
  const lookback = Number(policy.chain_observation.lookback_blocks);
  const chunk = Number(policy.chain_observation.log_chunk_blocks);
  const fromBlock = Math.max(0, latestBlock - lookback + 1);
  const topic0 = policy.chain_observation.erc20_transfer_topic;
  const topic2 = recipientTopic(policy.payment.receiving_address);
  const token = policy.payment.token_contract;
  const logs = [];

  for (let start = fromBlock; start <= latestBlock; start += chunk) {
    const end = Math.min(latestBlock, start + chunk - 1);
    const records = await rpcSettled('eth_getLogs', [{
      fromBlock: toHex(start),
      toBlock: toHex(end),
      address: token,
      topics: [topic0, null, topic2]
    }], urls);

    const buckets = new Map();
    for (const record of records) {
      if (!Array.isArray(record.result)) throw new Error(`RPC_GET_LOGS_NOT_ARRAY:${record.url}`);
      for (const log of record.result) {
        const key = canonicalLog(log);
        const bucket = buckets.get(key) || { log, urls: new Set() };
        bucket.urls.add(record.url);
        buckets.set(key, bucket);
      }
    }
    for (const bucket of buckets.values()) {
      if (bucket.urls.size >= RPC_QUORUM) logs.push({ ...bucket.log, _rpc_source_count: bucket.urls.size });
    }
  }
  return logs;
}

async function observationForLog(log, latestBlock, urls) {
  const receiptRecords = await rpcSettled('eth_getTransactionReceipt', [log.transactionHash], urls);
  const receiptWinner = quorumRepresentative(receiptRecords, receipt => JSON.stringify({
    transactionHash: String(receipt?.transactionHash || '').toLowerCase(),
    blockHash: String(receipt?.blockHash || '').toLowerCase(),
    blockNumber: String(receipt?.blockNumber || '').toLowerCase(),
    status: String(receipt?.status || '').toLowerCase()
  }), 'RPC_RECEIPT_QUORUM_DISAGREEMENT');
  const receipt = receiptWinner.result;
  if (String(receipt?.transactionHash || '').toLowerCase() !== String(log.transactionHash).toLowerCase()) throw new Error('RPC_RECEIPT_TX_HASH_MISMATCH');
  if (String(receipt?.blockHash || '').toLowerCase() !== String(log.blockHash).toLowerCase()) throw new Error('RPC_RECEIPT_BLOCK_HASH_MISMATCH');
  if (String(receipt?.blockNumber || '').toLowerCase() !== String(log.blockNumber).toLowerCase()) throw new Error('RPC_RECEIPT_BLOCK_NUMBER_MISMATCH');

  const blockRecords = await rpcSettled('eth_getBlockByNumber', [log.blockNumber, false], urls);
  const blockWinner = quorumRepresentative(blockRecords, block => JSON.stringify({
    hash: String(block?.hash || '').toLowerCase(),
    number: String(block?.number || '').toLowerCase(),
    timestamp: String(block?.timestamp || '').toLowerCase()
  }), 'RPC_BLOCK_QUORUM_DISAGREEMENT');
  const block = blockWinner.result;
  if (String(block?.hash || '').toLowerCase() !== String(log.blockHash).toLowerCase()) throw new Error('RPC_BLOCK_HASH_MISMATCH');

  const fromTopic = String(log.topics?.[1] || '');
  const from = /^0x[a-fA-F0-9]{64}$/.test(fromTopic) ? `0x${fromTopic.slice(-40)}` : null;
  const sourceCount = Math.min(Number(log._rpc_source_count || 0), receiptWinner.count, blockWinner.count);
  return {
    chain_id: Number(policy.payment.chain_id),
    token_contract: policy.payment.token_contract,
    tx_hash: log.transactionHash,
    from,
    to: policy.payment.receiving_address,
    amount_raw: parseRawAmount(log.data),
    block_number: Number(BigInt(log.blockNumber)),
    latest_block_number: latestBlock,
    removed: log.removed === true,
    receipt_status: String(receipt?.status).toLowerCase() === '0x1',
    observed_at: new Date(Number(BigInt(block.timestamp)) * 1000).toISOString(),
    rpc_quorum_verified: sourceCount >= RPC_QUORUM,
    rpc_source_count: sourceCount
  };
}

async function txAlreadyGrantedElsewhere(txHash, currentIssueNumber) {
  const q = encodeURIComponent(`repo:${REPOSITORY} \"${txHash}\"`);
  const result = await github(`/search/issues?q=${q}&per_page=20`);
  return (result.items || []).some(item => Number(item.number) !== Number(currentIssueNumber));
}

async function run() {
  if (policy.enabled !== true) {
    console.log(`HELIOS Pilot Authority: ARMED BUT DISABLED · ${policy.disabled_reason || 'UNSPECIFIED'}`);
    console.log('No invoice or grant can be issued until all activation gates and exact-head checks pass.');
    return;
  }

  validatePilotPaymentPolicy(policy);
  if (!TOKEN || !REPOSITORY) throw new Error('GITHUB_AUTOMATION_CONTEXT_REQUIRED');

  const head = await getRpcQuorumHead();
  console.log(`HELIOS Pilot Authority RPC quorum: ${head.sourceCount} source(s), safe head ${head.safeHead}, spread ${head.spread}.`);

  const issues = await listPilotIssues();
  if (!issues.length) {
    console.log('HELIOS Pilot Authority: no open pilot requests.');
    return;
  }

  const logs = await getRecentPaymentLogs(head.safeHead, head.urls);
  console.log(`HELIOS Pilot Authority: ${issues.length} request(s), ${logs.length} quorum-confirmed recent inbound ${policy.payment.asset} transfer log(s).`);

  for (const issue of issues) {
    const comments = await listComments(issue.number);
    if (comments.some(comment => String(comment.body || '').includes(GRANT_MARKER))) continue;

    let request;
    try {
      request = parsePilotIssueRequest(issue.body || '');
    } catch (error) {
      if (!comments.some(comment => String(comment.body || '').includes(INVALID_MARKER))) {
        await postComment(issue.number, invalidComment(error.message));
      }
      continue;
    }

    const invoiceEntry = comments
      .map(comment => ({ comment, invoice: parseInvoiceFromComment(comment.body) }))
      .find(entry => entry.invoice);

    if (!invoiceEntry) {
      const invoice = createPilotInvoice({
        issue_number: issue.number,
        request,
        policy,
        terms_sha256: termsSha256,
        issued_at_ms: Date.now()
      });
      await postComment(issue.number, invoiceComment(invoice));
      console.log(`Issued invoice ${invoice.invoice_id}.`);
      continue;
    }

    const invoice = invoiceEntry.invoice;
    if (invoice.terms_sha256 !== termsSha256) {
      console.warn(`Invoice ${invoice.invoice_id} is bound to an older/different terms digest; manual review required.`);
      continue;
    }

    if (invoice.payment?.chain_id !== policy.payment.chain_id || invoice.payment?.token_contract?.toLowerCase() !== policy.payment.token_contract.toLowerCase()) {
      console.warn(`Invoice ${invoice.invoice_id} is bound to a different payment policy; manual review required.`);
      continue;
    }

    const matchingLogs = logs.filter(log => {
      try { return parseRawAmount(log.data) === String(invoice.payment.exact_amount_raw); }
      catch { return false; }
    });

    let granted = false;
    for (const log of matchingLogs) {
      const observation = await observationForLog(log, head.safeHead, head.urls);
      const evidence = verifyPilotPaymentEvidence({
        invoice,
        observation,
        latest_block_number: head.safeHead,
        min_confirmations: policy.chain_observation.min_confirmations
      });
      if (!evidence.verified) continue;
      if (await txAlreadyGrantedElsewhere(evidence.tx_hash, issue.number)) {
        console.warn(`Rejected reused payment ${evidence.tx_hash} for issue #${issue.number}.`);
        continue;
      }

      const grant = issuePilotGrant({
        invoice,
        request,
        payment_evidence: evidence,
        granted_at_ms: Date.now(),
        term_days: policy.pilot_term_days
      });
      const canonical = JSON.stringify(grant);
      const digest = sha256(canonical);
      await postComment(issue.number, grantComment(grant, digest));
      await closeIssue(issue.number, 'completed');
      console.log(`Issued ${grant.grant_id} to ${grant.grantee.legal_entity_name}.`);
      granted = true;
      break;
    }

    if (granted) continue;

    if (Date.now() > Date.parse(invoice.expires_at)) {
      if (!comments.some(comment => String(comment.body || '').includes(EXPIRED_MARKER))) {
        await postComment(issue.number, expiredComment(invoice));
      }
      await closeIssue(issue.number, 'not_planned');
    }
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  run().catch(error => {
    console.error(`HELIOS Pilot Authority failed closed: ${error.stack || error.message}`);
    process.exitCode = 1;
  });
}
