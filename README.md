# Dan's AI Investment Committee — IRA Dashboard

Live portfolio dashboard built on Public.com's REST API, deployed on Netlify.

## How it works

```
Browser → Netlify Function → Public.com API
```

Two serverless functions act as a secure proxy:
- `/api/portfolio` → fetches account positions, P&L, and equity breakdown
- `/api/quotes` → fetches live quotes for all holdings + QQQ benchmark

Your API secret never touches the browser. It lives in Netlify's environment variables.

---

## Deploy to Netlify

### Step 1 — Push to GitHub

Create a new GitHub repo and push this entire folder:

```bash
git init
git add .
git commit -m "Initial dashboard"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2 — Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Choose your GitHub repo
3. Build settings are already in `netlify.toml` — no changes needed
4. Click **Deploy site**

### Step 3 — Set environment variables

In Netlify: **Site configuration → Environment variables → Add a variable**

| Variable | Value |
|----------|-------|
| `PUBLIC_COM_SECRET` | Your Public.com API secret key |
| `PUBLIC_COM_ACCOUNT_ID` | Your account ID (e.g. `5OC33019`) |

To get your secret key: [public.com/settings/security/api](https://public.com/settings/security/api)

### Step 4 — Redeploy

After adding env vars: **Deploys → Trigger deploy → Deploy site**

Your dashboard will be live at `https://YOUR-SITE-NAME.netlify.app`

---

## Sharing

The dashboard shows positions, weights, P&L, and investment thesis — but **no account number**. Safe to share the URL with friends.

## Updating the Watchlist

The Watchlist tab is updated every Sunday by the Weekly Watchlist Review scheduled task running in Cowork. To sync updates here, replace the `WATCHLIST_DATA` array in `index.html` with the latest data from the Cowork dashboard.

## Free tier usage

At a few refreshes per day, this uses well under 1% of Netlify's free tier (125,000 function invocations/month).
