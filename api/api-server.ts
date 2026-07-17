import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

const PORT = parseInt(process.env.API_PORT || '3000', 10);

async function loadHandler(name: string) {
  const mod = await import(`./${name}.ts`);
  return mod.default;
}

createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  try {
    const buffers: Buffer[] = [];
    for await (const chunk of req) buffers.push(chunk as Buffer);
    const body = Buffer.concat(buffers).toString();
    const parsedBody = body ? JSON.parse(body) : {};

    const mockReq = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: Object.fromEntries(url.searchParams),
      body: parsedBody,
      cookies: {},
    } as any;

    let statusCode = 200;
    let responseData: any = null;
    let ended = false;

    const mockRes = {
      status(code: number) { statusCode = code; return this; },
      json(data: any) { responseData = JSON.stringify(data); ended = true; },
      send(data: any) { responseData = data; ended = true; },
      setHeader() { return this; },
      getHeader() { return null; },
    } as any;

    const routeMap: Record<string, { methods: string[]; file: string }> = {
      '/api/create-order': { methods: ['POST'], file: 'create-order' },
      '/api/get-orders': { methods: ['GET'], file: 'get-orders' },
      '/api/update-order': { methods: ['PATCH'], file: 'update-order' },
      '/api/send-order-email': { methods: ['POST'], file: 'send-order-email' },
      '/api/delete-design': { methods: ['DELETE'], file: 'delete-design' },
    };

    if (pathname === '/api/test' && req.method === 'GET') {
      mockRes.json({ message: 'API works', env: { url: !!process.env.SUPABASE_URL, key: !!process.env.SUPABASE_SERVICE_ROLE_KEY } });
    } else if (routeMap[pathname] && routeMap[pathname].methods.includes(req.method)) {
      const handler = await loadHandler(routeMap[pathname].file);
      await handler(mockReq, mockRes);
    } else {
      statusCode = 404;
      responseData = JSON.stringify({ error: 'Not found' });
      ended = true;
    }

    if (!ended) {
      statusCode = 404;
      responseData = JSON.stringify({ error: 'No handler' });
    }

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(responseData);
  } catch (err: any) {
    console.error('API Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}).listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
