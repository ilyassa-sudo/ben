# Benabella Realty CRM Deployment

This CRM is a static website. It can be hosted on Netlify, Vercel, GitHub Pages, Cloudflare Pages, or any simple web hosting.

## Fastest Option: Netlify Drop

1. Go to https://app.netlify.com/drop
2. Drag this whole folder into the page:
   `/Users/ayoubbenabella/Documents/Codex/2026-05-29/agency-name-benabella-realty-location-agadir`
3. Netlify will give you a live link.

## Vercel

1. Create a new Vercel project.
2. Upload or import this folder.
3. No build command is needed.
4. Output/static directory is `.`

## Important Data Note

The CRM works locally in each browser by default. For shared live CRM data between phone and computer, configure the included Netlify Function with Supabase.

See `CLOUD_SYNC_SETUP.md`.
