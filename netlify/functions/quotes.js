// ── Public.com Quotes Function ────────────────────────────────────────────────
// Accepts a JSON body { symbols: ["AAPL", "NVDA", ...] } from the browser,
// fetches live quotes from Public.com, and returns a plain array of quote
// objects. Account ID stays server-side.

const AUTH_URL  = 'https://api.public.com/userapiauthservice/personal/access-tokens';
const API_BASE  = 'https://api.public.com/userapigateway/marketdata';

async function getAccessToken(secret) {
  const res = await fetch(AUTH_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ validityInMinutes: 5, secret }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const { accessToken } = await res.json();
  if (!accessToken) throw new Error('No access token returned');
  return accessToken;
}

export default async (request, context) => {
  const secret    = process.env.PUBLIC_COM_SECRET;
  const accountId = process.env.PUBLIC_COM_ACCOUNT_ID;

  if (!secret || !accountId) {
    return new Response(
      JSON.stringify({ error: 'Missing env vars' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let symbols = [];
  try {
    const body = await request.json();
    symbols = body.symbols || [];
  } catch (_) { /* no body — use empty list */ }

  if (symbols.length === 0) {
    return new Response(JSON.stringify([]), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  }

  // Public.com quotes endpoint expects [{symbol, type}] under "instruments"
  const instruments = symbols.map(s => ({ symbol: s, type: 'EQUITY' }));

  try {
    const token = await getAccessToken(secret);

    const quotesRes = await fetch(
      `${API_BASE}/${accountId}/quotes`,
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ instruments }),
      }
    );
    if (!quotesRes.ok) throw new Error(`Quotes API error: ${quotesRes.status}`);

    const { quotes } = await quotesRes.json();

    return new Response(JSON.stringify(quotes || []), {
      status:  200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const config = { path: '/api/quotes' };
