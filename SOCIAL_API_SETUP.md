# Real Instagram and TikTok Data

The CRM can track social posts manually now. Pulling real Instagram/TikTok metrics automatically needs a small secure backend because access tokens and app secrets must not live inside browser JavaScript.

## Instagram / Facebook

Use Meta's official Instagram/Graph APIs for a Business or Creator account. The backend should handle:

- Meta Login / OAuth
- Long-lived token storage
- Instagram account and media lookup
- Insights sync into the CRM

## TikTok

Use TikTok Login/API access. The backend should handle:

- OAuth 2.0 login
- Secure access token storage
- Video list/query requests
- Metrics sync into the CRM

## Recommended Next Step

Move the CRM from a static-only site to a small hosted app with:

- Supabase for shared CRM data
- Netlify/Vercel serverless functions for Instagram/TikTok API calls
- A protected admin-only settings page for account connections

