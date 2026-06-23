# CLAUDE.md — Inkwell Marketing Site

Guidance for Claude when working in this repository.

## What this is

The public marketing website for **Inkwell**, a serene app for writing novels —
served at **inkwell.world**. It is intentionally separate from the product app
(`trlabarge/inkwell`) so marketing changes can never affect the editor deploy.

Plain static **HTML / CSS / vanilla JS**. No build step, no framework, no bundler,
no package manager. Files are served as-is by Vercel.

## The one job of this site

Show writers that Inkwell is the calm, beautiful place to start their novel — and
that getting started is **quick and easy**. Every change should make the site
cleaner, friendlier, more accessible, and clearer about how fast a writer can
begin. If a change doesn't serve that, question it.

## Working agreement

Be fast, efficient, and autonomous.

- **Create and edit freely.** You don't need explicit permission to make changes,
  commit them, and push to the working branch. Move quickly.
- **Never merge without me knowing.** Don't merge a PR (or push directly to
  `main`) unless I've explicitly said so. I want to be aware of anything that
  goes live.
- **Clear major changes with me first.** Anything structural, or that adds
  complexity (new tooling, dependencies, a build step, JS frameworks, large
  refactors), needs a go-ahead before you start — not after.
- Open a PR for new work and tell me the number. Pushing to the branch updates
  the open PR; don't open duplicates.

## Hard rules (don't break these)

- **Keep it zero-build.** No bundler, framework, npm, or build tooling. Static
  HTML/CSS/JS only.
- **Don't touch the product app.** Never reference or assume changes to
  `trlabarge/inkwell`.
- **Preserve CTA targets.** All app call-to-action links must point to
  `https://app.inkwell.world/auth`.
- **Internal links stay extensionless.** `vercel.json` sets `cleanUrls: true`,
  so link to `/pricing`, `/privacy`, `/terms` — never `.html`.

## Brand voice

**Warm and literary.** Inkwell is a writing sanctuary, so copy should feel
elegant, human, and craft-focused. Favor calm, evocative language over hype,
buzzwords, or exclamation-heavy SaaS-speak. Keep it concise and welcoming.

## Project structure

```
index.html        Home (hero, features, testimonials, FAQ)
pricing.html      Pricing tiers
privacy.html      Privacy Policy
terms.html        Terms of Service
styles.css        All styling (single shared stylesheet)
assets/           Images (favicon.png, wordmark-dark.png, wordmark-light.png)
vercel.json       Clean URLs + caching/security headers
README.md         Deploy + domain notes
```

## Conventions

- **Styling** lives entirely in `styles.css`, shared across all pages. Use the
  CSS custom properties in `:root` (design tokens) — colors (`--ink`, `--text`,
  `--bg-sage`, hero gradient stops…), spacing/radius (`--radius`, `--maxw`), and
  fonts. Don't hardcode hex values or fonts that bypass the tokens.
- **Fonts** are Google Fonts: `--font-display` Cinzel, `--font-serif` Lora,
  `--font-sans` Alegreya Sans (plus Spectral / Allura / Cinzel Decorative for
  accents). Match the existing type hierarchy rather than introducing new faces.
- **JavaScript** is small, vanilla, page-scoped, wrapped in IIFEs inside an inline
  `<script>` at the bottom of each page (e.g. scroll-aware header, hero
  typewriter). Keep it dependency-free and progressive — the page must work
  without it.
- **Accessibility is a feature.** Maintain `alt` text, `aria-label`s, and
  `aria-live` regions. Any motion must respect
  `prefers-reduced-motion` (existing JS already does).
- **New pages** should copy an existing page's `<head>`, header, and footer so
  fonts, nav, brand wordmark, and CTAs stay consistent.
- **Images** go in `assets/`. PNGs are cached 7 days via `vercel.json`; keep them
  optimized.

## SEO / metadata

Every page has `<title>`, `<meta name="description">`, `<link rel="canonical">`,
and a full Open Graph + Twitter Card block in `<head>`. Keep these consistent
across all pages and in sync with the page title/description when you edit copy.

- Canonical and `og:url` use the absolute apex URL, extensionless
  (`https://inkwell.world/pricing`).
- The social card image is currently `assets/wordmark-dark.png` as a stopgap. A
  dedicated **1200×630** social card (`assets/og-image.png`) would be better —
  swap it in across all pages once it exists.

## Local preview

No build needed:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Note: `cleanUrls` is a Vercel feature, so extensionless links resolve in
production but may 404 under a plain local server — preview with the `.html`
URL directly if needed.
