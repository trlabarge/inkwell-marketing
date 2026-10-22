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
