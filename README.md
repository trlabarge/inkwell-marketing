# Inkwell — Marketing Site

The public marketing website for [Inkwell](https://app.inkwell.world), served at
**inkwell.world**. Plain static HTML/CSS/JS — no build step.

This repo is intentionally separate from the product app (`trlabarge/inkwell`) so
marketing changes can never affect the editor deploy.

## Structure

```
index.html        Home (hero, features, testimonials, FAQ)
pricing.html      Pricing tiers
privacy.html      Privacy Policy
terms.html        Terms of Service
styles.css        All styling
assets/           Images
  favicon.png       Favicon
  wordmark-*.png    Logo (dark = on light header, light = on dark footer)
vercel.json       Clean URLs + caching/security headers
```

All app CTAs link to `https://app.inkwell.world/auth`.

## Local preview

No build needed — just serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy (Vercel)

Auto-deploys on every push to `main`.

1. **Vercel → New Project** → import this repo.
2. Framework Preset: **Other**. No build command. Output directory: **`.`** (root).
3. Deploy.

### Domain (inkwell.world)

The product app keeps `app.inkwell.world`; this site takes the apex.

1. Vercel project → **Settings → Domains** → add `inkwell.world` and `www.inkwell.world`
   (Vercel auto-redirects `www` → apex).
2. At **Namecheap**, set the DNS records Vercel shows:
   - Apex `inkwell.world`: `A` record → Vercel's IP (or an `ALIAS`/`ANAME` to
     `cname.vercel-dns.com` if supported).
   - `www`: `CNAME` → `cname.vercel-dns.com`.
3. Wait for DNS to propagate; Vercel issues the SSL cert automatically.

## Editing notes

- `vercel.json` has `cleanUrls: true`, so internal links are extensionless
  (`/pricing`, `/privacy`, `/terms`). Keep new internal links extensionless too.
- `styles.css` is unhashed, so it is not long-cached — changes go live immediately.
  Image assets (`*.png`) are cached for 7 days.
