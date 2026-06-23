# TikTok Shop CSE Demo

A single Next.js app (App Router) that walks through the merchant integration
flow a TikTok Shop Customer Solutions Engineer needs to understand:

```
Connect account → Send product to TikTok Shop → Sync inventory →
Register affiliate offer → Customer orders → Webhook fires → Label created
```

Every step is a real HTTP request to a local API route — they're mocked
(no live TikTok Shop / Shopify / ShipStation credentials needed), but the
request/response shapes mirror the real APIs so the flow is demo- and
interview-ready.

## Structure

```
app/
  page.js                     UI: product card + live "integration console"
  api/
    auth/tiktok/route.js      Mock OAuth2 handshake
    products/create/route.js  Mock product push to TikTok Shop catalog
    inventory/sync/route.js   Mock inventory sync
    affiliate/create/route.js Mock affiliate offer + shareable link
    orders/webhook/route.js   Mock TikTok order webhook receiver
    shipstation/mock/route.js Mock ShipStation label creation
```

Everything is one Next.js app — no separate backend service to deploy or
keep in sync, which keeps this a single Vercel project.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Swap in the real APIs later

Each route file has a comment pointing at the real TikTok Shop / ShipStation
endpoint it stands in for. To go from mock to real:

1. Add real credentials as environment variables (never commit them).
2. Replace the `setTimeout` + fake response in each route with an actual
   `fetch()` call to the real API, using the stored access token.
3. Verify webhook signatures in `orders/webhook/route.js` before trusting
   the payload.
