# Search Console log

One entry per monthly refresh run. Property: `sc-domain:inkwell.world`.
"Branded" means inkwell, ink well, inkwel and similar misspellings.

## 2026-10-22 (baseline, Jul 22 to Oct 19)

- Totals: 513 clicks, 40,365 impressions, CTR 1.27%, average position 10.4
- Branded queries: all 412 query-attributed clicks (27,009 impressions);
  101 clicks are from anonymized queries; 472 non-branded queries
  reported, 1,050 impressions, 0 clicks
- Top pages by impressions: home (30,752 imp, pos 7.0),
  /learn/tools/word-count-to-pages (5,681 imp, pos 14.5, 6 clicks),
  www./learn/tools/word-count-to-pages (2,183 imp, pos 32.1),
  /learn/tools/writing-pace (297 imp, pos 7.3, 0 clicks),
  /writing-apps-breakdown (262 imp, pos 36.2), /learn/tools/novel-length (217 imp, pos 31.0)
- Top non-branded queries by impressions: how long is 300 words (20, pos 53),
  250 words is how many pages (19, pos 37), 80000 words in pages (15, pos 16),
  best novel writing apps (14, pos 61), best writing apps (12, pos 51),
  80000 words is how many pages (11, pos 8), 3000 words in pages (10, pos 56),
  how many pages is 10000 words (10, pos 48), how many pages is 200000 words (9, pos 18),
  how long is a novel (8, pos 56)
- Issue: `www.inkwell.world` URLs are indexed alongside the apex, splitting
  signals. Cause: the apex 307-redirected to `www` while every canonical,
  `og:url`, and the sitemap pointed at the apex. Fixed 2026-10-22 in Vercel:
  `inkwell.world` now serves Production and `www.inkwell.world` 308-redirects
  to it. Watch for `www.` URLs dropping out of the page report over the next
  few weeks.
- Index coverage (URL inspection of all 25 sitemap URLs, 2026-10-22):
  13 indexed. Not indexed: URL unknown to Google (5): /pricing, /compare,
  /learn, /compare/ellipsus, /compare/google-docs. Discovered, not indexed
  (3): /compass, /compare/dabble, /compare/reedsy. Crawled, not indexed (4):
  /learn/how-to-write-a-story-bible, /learn/how-to-build-a-character-profile,
  /learn/how-to-plan-a-book-series, /compare/scrivener. Likely cause: the
  apex-to-www redirect loop above. Owner requesting indexing manually from
  2026-10-22.
- Sitemaps: submitted https://inkwell.world/sitemap.xml (25 URLs, 0 errors)
  on 2026-10-22; removed the www sitemap and four stale 2024 WordPress
  sitemaps. Page indexing shows no "Not found (404)" rows, so there are no
  legacy URLs to redirect.
- Generative AI report (manual export, Jul 21 to Oct 20, raw CSVs in
  `content/gsc-exports/2026-10-generative-ai/`): 2,538 impressions, the
  report gives no clicks. Daily average rose from about 12 (late Jul to Aug)
  to about 65 (Sep 27 to Oct 20), roughly 5x, starting around Sep 9 when
  the learn/ guides and tools launched. Monthly: Jul (10 days) 125, Aug 314,
  Sep 788, Oct (20 days) 1,311. Pages: home 1,764 (69%),
  /learn/tools/word-count-to-pages 645 across apex and www (25%), writing
  pace 32, writing apps breakdown 23, story bible guide 9; nothing else
  above 11. Countries: Brazil 497, United States 359, Indonesia 204, India
  147, Mexico 91. English-speaking countries are only 23% of impressions.
  Devices: desktop 62%, mobile 37%.

## 2026-11-03 (monthly refresh, Aug 3 to Oct 31)

- Totals: 518 clicks, 44,890 impressions, CTR 1.15%, average position 10.0
  (baseline: 513 clicks, 40,365 impressions, CTR 1.27%, position 10.4).
  Last 28 days (Oct 4 to 31) against the 28 before: 136 vs 169 clicks,
  16,730 vs 14,731 impressions, position 8.6 vs 12.7.
- Branded queries: all 412 query-attributed clicks (30,004 impressions);
  106 clicks from anonymized queries. 962 non-branded queries reported,
  2,951 impressions (6.6% of all impressions, up from 2.6%), 0 clicks.
  Branded matching now also catches the misspellings Search Console
  reports (inkweel, inkwrll, inkeell, ikwell and similar).
- Top pages by impressions: home (32,485 imp, pos 6.9, 490 clicks),
  /learn/tools/word-count-to-pages (8,265 imp, pos 12.4, 9 clicks),
  www./learn/tools/word-count-to-pages (2,183 imp, pos 32.1, no
  impressions since the Oct 22 redirect fix), /learn/tools/writing-pace
  (378 imp, pos 7.3, 0 clicks, no non-branded queries attributed),
  /writing-apps-breakdown (290 imp, pos 37.7, 6 clicks),
  /learn/tools/novel-length (250 imp, pos 28.1, 0 clicks).
- Top non-branded queries by impressions: words to pages (143, pos 41),
  word count to pages (123, pos 39), word count into pages (95, pos 38),
  how many words in 25 pages (63, pos 44), how many words is 10 pages
  (56, pos 49), how many pages is 80000 words (55, pos 10), how many pages
  is 600 words (50, pos 51), how many pages is 300 words (49, pos 50),
  pages to words (45, pos 51), word to page converter (33, pos 47).
  The 80,000 word variants are the only family in positions 8 to 20.
- **Issue: /learn/tools/word-count-to-pages dropped out of the index.**
  Daily impressions fell from about 285 (Oct 27) to 116, 61, 9 and 0
  (Oct 28 to 31). Inspection says "Crawled, currently not indexed" with a
  last crawl of Sep 24, so Google has not yet seen the B02 rework merged
  Oct 29. The www copy is correctly reported as "Alternate page with
  proper canonical tag". Owner to request indexing.
- Index coverage (URL inspection of all 26 sitemap URLs, 2026-11-03):
  21 indexed (up from 13). Crawled, not indexed (3):
  /learn/tools/word-count-to-pages, /learn/tools/novel-length,
  /learn/glossary (all three were indexed on Oct 22). Discovered, not
  indexed (2): /compare/ellipsus, /compare/google-docs (unknown to Google
  on Oct 22). Newly indexed since Oct 22: /pricing, /compare, /learn,
  /compass, /compare/dabble, /compare/reedsy, /compare/scrivener, and the
  story bible, character profile and book series guides; the 50,000 words
  guide was indexed on first crawl.
- Generative AI report: no new export since `2026-10-generative-ai`
  (data to Oct 20, 14 days old), so no comparison this month.
