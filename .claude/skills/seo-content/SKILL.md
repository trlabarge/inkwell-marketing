---
name: seo-content
description: Playbook for Inkwell's scheduled SEO/AEO/GEO runs. Use when asked to run the SEO content run, the monthly refresh, or the backlog research run, or to write or improve any guide, tool, glossary, or comparison page under learn/ or compare/.
---

# Inkwell SEO playbook

This skill drives three scheduled runs. Each one starts in a fresh cloud
session, opens **one PR**, and stops. **Never merge, never push to `main`.**
CLAUDE.md applies in full; this file adds the SEO workflow on top of it.

| Mode | When | Output |
|---|---|---|
| `content` | Tue and Thu | One new page (or one high-priority rework) from `content/backlog.md` |
| `refresh` | Monthly, 3rd | Improvements to existing pages, driven by Search Console data |
| `research` | Monthly, 17th | New and reordered rows in `content/backlog.md` only |

## Step 0: Housekeeping (every mode, before anything else)

1. `git fetch origin main` and list open PRs whose title starts with `SEO:`.
2. For each open `SEO:` PR with a merge conflict, merge `main` into its
   branch, resolve (sitemap.xml, llms.txt, llms-full.txt and hub pages are
   the usual spots: keep both sides' entries), run `python3 scripts/check.py`,
   and push. Never rebase or force-push.
3. **Backpressure.** If four or more `SEO:` PRs are already open, do not
   start new work. Post nothing on GitHub; end the run with a one-line
   summary saying it skipped because the review queue is full.
4. A backlog item that appears in an open `SEO:` PR title (by its ID) is
   claimed. Skip it.

## Who we write for

Novelists at every stage, searching for craft help. Pages are
**tool-agnostic and genuinely useful to a writer who never signs up**. That
is what earns rankings, citations from answer engines, and links. Inkwell
appears once near the end, softly, in the `guide-inkwell` block.

## Page anatomy (copy it, don't invent it)

Start from the closest existing page and keep its `<head>`, header, nav,
footer and bottom `<script>` exactly:

- Guides: `learn/how-to-outline-a-novel.html`
- Tools: `learn/tools/word-count-to-pages.html`
- Comparisons: `compare/dabble.html` (+ `compare/compare-data.js`)

Every new guide or tool page has, in order:

1. **Hero**: `guide-crumb`, an H1 phrased like the search query, a one-line
   standfirst, `guide-meta` read time.
2. **`guide-answer` "The short answer"**: 40 to 60 words that fully answer
   the query on their own. This is the passage answer engines quote, so
   lead with the fact, include the key number, no throat-clearing.
3. **`guide-toc`** with anchor links to every H2.
4. **Body**: H2s phrased as the questions writers actually ask. At least
   one concrete artifact per page: a worked example, a comparison table
   (`guide-table`), a template, or a checklist. Use `guide-note` for asides.
5. **FAQ** (`guide-faq`, 4 to 6 `details.faq-item`), drawn from People Also
   Ask and Search Console queries.
6. **`guide-inkwell`**: one short paragraph on how Inkwell helps with this
   exact task, one `Start Writing` button to `https://app.inkwell.world/auth`.
7. **`guide-related`**: three related cards.

Structured data in `<head>` (must mirror visible text word for word):
`BreadcrumbList`, `Article` (with `datePublished`, `dateModified`,
`wordCount`, `about`), `FAQPage`, and `HowTo` when the page teaches steps.
Tools add `WebApplication` if the template page has it.

Target length: whatever fully answers the query. Usually 1,200 to 2,500
words for guides. Never pad.

## Wiring a new page in (all required)

- `sitemap.xml`: add the URL with today's `lastmod`.
- `llms.txt`: one line under the right heading. `llms-full.txt`: a section
  with the short answer and a "Covers:" line, plus the page index entry.
  Bump "Last updated" in both.
- Hub page: `learn/guides.html` or `learn/tools/index.html` (card and the
  `ItemList` JSON-LD, update `numberOfItems`), and `learn/index.html` if the
  page fits one of its phases.
- **Internal links**: add contextual links to the new page from two or three
  existing pages where it genuinely helps the reader, plus glossary entries
  that define its terms. Swap one `guide-related` card if the new page is a
  better fit.
- New glossary terms the page introduces go in `learn/glossary.html` (HTML
  and the `DefinedTermSet` JSON-LD).

## Copy rules (the brand voice in CLAUDE.md, summarized)

- Warm, literary, calm, concise. No hype, no exclamation marks, no
  "unlock", "supercharge", "game-changer".
- **No em dashes anywhere**, including JSON-LD and meta.
- **Inkwell is never described as "AI"** or "AI-powered". Describe Compass
  and other features by outcome. Competitors **may** be called AI tools when
  that is how they position themselves (Sudowrite, NovelAI and similar); keep
  those uses on `compare/` and `writing-apps-breakdown` pages, or clearly
  attributed to the competitor.
- The codex is "your story stays connected", never a wiki or graph.
- No invented statistics, studies, quotes, testimonials or author anecdotes.
  Numbers are either sourced (link the source) or derived on the page
  (show the arithmetic). Publishing norms like typical word counts are fine
  stated as ranges with a source.
- Product facts and pricing come from `pricing.html` and
  `CLAUDE-inkwell-app-*.md`. If they disagree, `pricing.html` wins.

## Research inputs

- **Search Console** via the Composio connector, property
  `sc-domain:inkwell.world` (use exactly that string). Tool:
  `GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY`. Pull the last 90 days by
  `query` and by `page` (`data_state: "all"`, `row_limit` up to 1000).
  Ignore branded queries (inkwell, ink well, inkwel and other misspellings).
  If the connector is unavailable, say so in the PR body and continue
  from web search; never invent query data.
- **Generative AI report** (Search Console → Performance → Generative AI,
  how often Google's AI answers show the site). The API cannot read it, so
  the owner exports it by hand into `content/gsc-exports/<YYYY-MM>-generative-ai/`.
  Refresh and research runs read the newest export if there is one, compare
  it with the previous one in `content/search-console-log.md`, and, if the
  newest export is more than 40 days old, ask in the PR body for a fresh one.
- **Web search** for what currently ranks, People Also Ask, and gaps.
- **Direct fetches** work only for allowlisted domains (competitor sites,
  reddit). If a fetch is blocked, note it and rely on search results.
- For comparisons, confirm competitor pricing and features on the
  competitor's own site and put the check date in the PR body.

## Verify before opening the PR

1. `python3 scripts/check.py` must show **0 errors**. Read every WARN that
   touches a file you changed and fix it or explain it in the PR body.
2. Serve locally (`python3 -m http.server 8000`) and load the `.html` URL
   with Playwright at 1280px and 390px wide. Screenshot both; confirm no
   horizontal scroll, the TOC anchors work, FAQ items open, and any tool
   computes correctly. Check the browser console for errors.
3. Re-read the page once as a skeptical novelist: is every section useful,
   is anything padded, is the short answer actually the answer?

## The PR

- Branch: the branch your session was assigned. Commit in small, clear
  commits.
- Title: `SEO: <backlog ID> <page title>` (for example
  `SEO: C07 How Long Should a Chapter Be?`). Refresh runs use
  `SEO: Monthly refresh <YYYY-MM>`; research runs use
  `SEO: Backlog research <YYYY-MM>`.
- Body: target query and why (Search Console numbers if any), what was
  added, the internal links you added, check.py output summary, the two
  screenshots, and anything blocked or uncertain.
- In the same PR, set the backlog row's status to `in PR` and fill in the
  PR number. Rows move to `live` in the next run after merge.

## Mode: content

1. Housekeeping (Step 0).
2. Take the highest unclaimed `todo` row in `content/backlog.md`
   (priority order is top to bottom).
3. Pull fresh Search Console data for related queries; search the target
   query and read the top results so the page beats them on usefulness.
4. Write the page, wire it in, verify, open the PR.

## Mode: refresh

1. Housekeeping (Step 0).
2. Pull 90 days of Search Console data by page and by query. Flag pages
   with: impressions over 100 and CTR under 1% (rewrite title and meta
   description); average position 8 to 20 (strengthen the short answer, add
   the missing subtopics those queries imply, add FAQs); queries with
   impressions but no page that answers them (add backlog rows).
3. Fix at most five pages per run, highest impressions first. Update each
   page's `dateModified` / `article:modified_time` and sitemap `lastmod`
   only when content actually changed.
4. Also: mark merged rows `live` in the backlog, keep the compare hub,
   spoke tables and `compare/compare-data.js` in sync, and fix any broken
   links check.py reports.
5. **Index coverage.** Run `GOOGLE_SEARCH_CONSOLE_INSPECT_URL` on every
   URL in `sitemap.xml` (about 25 calls; the quota is 2,000 a day). Record
   each one's `coverageState`. Any page not "Submitted and indexed" for 30
   days or more counts toward this run's five pages: strengthen its short
   answer, add internal links to it from indexed pages, and make sure it is
   linked from its hub. List the unindexed URLs in the PR body so the owner
   can use "Request indexing" in Search Console (the API cannot).
6. Add a dated entry to `content/search-console-log.md` with totals
   (clicks, impressions, CTR, position, non-branded share), the top ten
   non-branded queries, and the indexed / not indexed counts with the
   unindexed URLs, so trends are visible over time.

## Mode: research

1. Housekeeping (Step 0).
2. Gather candidates from: Search Console non-branded queries with no
   matching page; People Also Ask for existing pages' topics; seasonal
   moments in the next 8 weeks (NaNoWriMo prep in Sept and Oct, New Year
   writing goals in Dec and Jan, Camp NaNoWriMo in Mar and Jun); and gaps
   in competitors' learn and blog sections.
3. Add up to ten new rows and reorder `todo` rows so the top five are the
   best opportunities: demand, a realistic chance to rank, and fit with a
   novelist who would use Inkwell. Write the one-line reason in the row.
4. Change only `content/backlog.md` in this PR.
