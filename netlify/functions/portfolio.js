// ── Public.com Portfolio Function ─────────────────────────────────────────────
// Exchanges secret key for a short-lived access token, then fetches the
// account portfolio. Secret and account ID live in Netlify environment
// variables — never exposed to the browser.

const AUTH_URL  = 'https://api.public.com/userapiauthservice/personal/access-tokens';
const API_BASE  = 'https://api.public.com/userapigateway/trading';

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
      JSON.stringify({ error: 'Missing PUBLIC_COM_SECRET or PUBLIC_COM_ACCOUNT_ID env vars' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const token = await getAccessToken(secret);

    const portfolioRes = await fetch(
      `${API_BASE}/${accountId}/portfolio/v2`,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    if (!portfolioRes.ok) throw new Error(`Portfolio API error: ${portfolioRes.status}`);

    const data = await portfolioRes.json();
    return new Response(JSON.stringify(data), {
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

export const config = { path: '/api/portfolio' };
