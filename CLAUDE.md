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

### Copy rules (match the product app's voice)

- **No em dashes, ever.** Rewrite with commas, periods, parentheses, or "and".
  This applies to all on-page copy and metadata.
- **Never say "AI."** The product never brands features as "AI" or "AI-powered."
  Name features by their outcome (e.g. "summarization and brainstorming tools",
  "story intelligence"). The only sanctioned use of the word is a future privacy
  pledge about what we will never do.
- **Lead with momentum and finishing.** The product's positioning is "the best
  place to actually finish your novel" and "start writing in seconds." Emphasize
  how quick and easy it is to begin, not just serenity.
- **"Your story stays connected"** is the approved framing for the codex / linked
  characters and lore. Do not market it as a "wiki" or a "graph" product.
- Mirror the app's tone: calm, encouraging, craft-focused. Avoid hype and
  pressure. Reference `CLAUDE-inkwell-app-*.md` for product facts and positioning
  before writing feature or pricing copy.

## Project structure

```
index.html        Home (hero, features, testimonials, FAQ)
pricing.html      Pricing tiers
privacy.html      Privacy Policy
terms.html        Terms of Service
compare/          Comparison landing page + one page per competitor
styles.css        All styling (single shared stylesheet)
assets/           Images (favicon.png, wordmark-dark.png, wordmark-light.png,
                  scrivener.png, dabble-logo.png)
llms.txt          Plain-language summary of the product for LLM crawlers
sitemap.xml       Lists every indexable URL (keep in sync when adding pages)
robots.txt        Crawler rules
vercel.json       Clean URLs + caching/security headers
README.md         Deploy + domain notes
```

## What's on the site

- **Home (`index.html`)** — Hero ("Your Writing Sanctuary") with a typewriter
  sub-headline, a "Start writing in seconds" steps section, a tabbed feature
  showcase (Codex, Character sketch, Lore, Project management, Share, Export)
  with interactive mocked-up UI demos, a "structure without chaos" section,
  a "Start Your Story" challenge/demo block, testimonials ("Loved by Writers"),
  and an FAQ (differentiation, data security/privacy, collaboration, device
  support, offline use, export formats).
- **Pricing (`pricing.html`)** — Three tiers: **Inkling** (free forever — 1
  active project, unlimited documents, character profiles, lore database,
  Focus Mode, autosave, Markdown/TXT export, beta reader sharing), **Storyteller**
  ($9/mo, featured — unlimited projects, multi-book/series organization, DOCX/
  PDF/EPUB export, writing stats, summarization and brainstorming tools "in
  development", priority support), and **Worldbuilder** ($19/mo, "Coming soon" —
  advanced lore relationships, story graph/universe visualization, faction
  tracking, timeline management, continuity tracking).
- **Compare (`compare/`)** — A comparison hub (`compare/index.html`) plus
  dedicated alternative pages for Scrivener, Dabble, Google Docs, Microsoft
  Word, and Reedsy, each pitching Inkwell as the alternative. Only the
  Scrivener and Dabble pages are currently listed in `sitemap.xml`.
- **Privacy (`privacy.html`)** and **Terms (`terms.html`)** — Standard policy
  pages matching the product app's data practices.
- **`llms.txt`** — A short, structured summary of Inkwell (what it is, pricing,
  export formats, key page links) aimed at LLM crawlers. Keep it in sync with
  on-page copy and the brand voice rules (no "AI", no em dashes) whenever
  product facts or pricing change.

App CTAs throughout the site read "Start Writing" / "Become a Storyteller" and
all point to `https://app.inkwell.world/auth`.

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
