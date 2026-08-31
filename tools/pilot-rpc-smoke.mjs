import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const policy = JSON.parse(await readFile(new URL('../commerce/HELIOS_PILOT_PAYMENT_POLICY.json', import.meta.url), 'utf8'));

function sha256(text) {
  return createHash('sha256').update(String(text)).digest('hex');
}

async function rpc(url, method, params = []) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new Error(`RPC_${payload.error.code}:${payload.error.message}`);
    return payload.result;
  } finally {
    clearTimeout(timer);
  }
}

function recipientTopic(address) {
  return `0x${String(address).toLowerCase().replace(/^0x/, '').padStart(64, '0')}`;
}

const urls = [...new Set(policy.chain_observation?.rpc_urls || [])];
const quorum = Number(policy.chain_observation?.rpc_quorum || 0);
const expectedChain = String(policy.chain_observation?.expected_chain_id_hex || '').toLowerCase();
const maxSpread = Number(policy.chain_observation?.max_head_spread_blocks ?? 8);

if (urls.length < 2 || quorum < 2 || quorum > urls.length) throw new Error('RPC_QUORUM_POLICY_INVALID');
if (!/^0x[a-fA-F0-9]{40}$/.test(String(policy.payment?.receiving_address || ''))) throw new Error('RPC_SMOKE_RECEIVING_ADDRESS_REQUIRED');

const observations = await Promise.all(urls.map(async url => {
  const chainId = String(await rpc(url, 'eth_chainId')).toLowerCase();
  const blockHex = await rpc(url, 'eth_blockNumber');
  const blockNumber = Number(BigInt(blockHex));
  const code = String(await rpc(url, 'eth_getCode', [policy.payment.token_contract, 'latest']));
  if (chainId !== expectedChain) throw new Error(`RPC_CHAIN_ID_MISMATCH:${url}:${chainId}`);
  if (!Number.isSafeInteger(blockNumber) || blockNumber <= 0) throw new Error(`RPC_BLOCK_NUMBER_INVALID:${url}`);
  if (!/^0x[a-fA-F0-9]+$/.test(code) || code === '0x') throw new Error(`RPC_USDT_CONTRACT_CODE_MISSING:${url}`);
  return { url, chainId, blockNumber, codeSha256: sha256(code) };
}));

const heads = observations.map(x => x.blockNumber);
const safeHead = Math.min(...heads);
const spread = Math.max(...heads) - safeHead;
if (spread > maxSpread) throw new Error(`RPC_HEAD_SPREAD_TOO_LARGE:${spread}`);
if (new Set(observations.map(x => x.codeSha256)).size !== 1) throw new Error('RPC_USDT_CONTRACT_CODE_DISAGREEMENT');

const fromBlock = Math.max(0, safeHead - 32);
const filter = {
  fromBlock: `0x${fromBlock.toString(16)}`,
  toBlock: `0x${safeHead.toString(16)}`,
  address: policy.payment.token_contract,
  topics: [policy.chain_observation.erc20_transfer_topic, null, recipientTopic(policy.payment.receiving_address)]
};

const logChecks = await Promise.all(urls.map(async url => {
  const logs = await rpc(url, 'eth_getLogs', [filter]);
  if (!Array.isArray(logs)) throw new Error(`RPC_GET_LOGS_NOT_ARRAY:${url}`);
  return { url, logCount: logs.length };
}));

console.log(JSON.stringify({
  schema: 'janus.helios.pilot-rpc-smoke.v1',
  status: 'PASS',
  chain_id: 1,
  rpc_sources: observations.map(({ url, chainId, blockNumber, codeSha256 }) => ({ url, chainId, blockNumber, codeSha256 })),
  quorum_required: quorum,
  safe_head: safeHead,
  head_spread_blocks: spread,
  usdt_contract: policy.payment.token_contract,
  receiving_address: policy.payment.receiving_address,
  eth_getLogs_supported: logChecks,
  fund_movement_authority: false
}, null, 2));
