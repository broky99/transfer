// KIS Bridge API for Cloudflare Workers
// GPT Action -> Worker -> GitHub repository payload

const REPO_OWNER = 'broky99';
const REPO_NAME = 'transfer';
const BRANCH = 'main';
const PAYLOAD_PATH = 'data/payload.json';

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'content-type, authorization, x-kis-secret'
    }
  });
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin);
}

async function githubGet(env) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${PAYLOAD_PATH}?ref=${BRANCH}`;
  const r = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'User-Agent': 'kis-bridge-worker'
    }
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub GET ${r.status}: ${await r.text()}`);
  return await r.json();
}

async function githubPut(env, payload) {
  const current = await githubGet(env);
  const body = {
    message: 'KIS Bridge: GPT payload update',
    branch: BRANCH,
    content: utf8ToBase64(JSON.stringify(payload, null, 2))
  };
  if (current?.sha) body.sha = current.sha;

  const r = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${PAYLOAD_PATH}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
      'User-Agent': 'kis-bridge-worker',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`GitHub PUT ${r.status}: ${await r.text()}`);
  return await r.json();
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return json({ ok: true });

    try {
      const url = new URL(request.url);
      if (url.pathname !== '/send') return json({ error: 'Not found' }, 404);
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

      const providedSecret = request.headers.get('x-kis-secret') || '';
      if (!env.KIS_SECRET || providedSecret !== env.KIS_SECRET) {
        return json({ error: 'Unauthorized' }, 401);
      }

      const body = await request.json();
      const text = String(body.text || '').trim();
      const category = String(body.category || 'Sonstiges').trim();
      if (!text) return json({ error: 'Text is required' }, 400);

      // Plain payload for maximum compatibility with the current KIS Bridge.
      // Do not include patient identifiers if hospital policy forbids external transfer.
      const item = {
        v: 3,
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        category,
        text,
        source: 'gpt-action',
        checksum: await sha256Hex(text)
      };

      await githubPut(env, item);
      return json({ ok: true, id: item.id, category: item.category, checksum: item.checksum });
    } catch (e) {
      return json({ error: String(e.message || e) }, 500);
    }
  }
};
