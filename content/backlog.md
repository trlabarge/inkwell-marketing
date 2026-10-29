# SEO content backlog

Work queue for the scheduled SEO runs (see `.claude/skills/seo-content/SKILL.md`).
Priority is top to bottom: a content run takes the highest `todo` row not
already claimed by an open `SEO:` PR. Reorder freely; IDs never change.

Status: `todo` → `in PR` (with PR number) → `live` (after merge).
Type: `new` page, `rework` of an existing page, `compare` page, `glossary`.

Seeded 2026-10-22 from 90 days of Search Console data (Jul 22 to Oct 19:
513 clicks, 40,365 impressions, average position 10.4). Every click Search
Console attributes to a query (412) is branded ("inkwell" and variants);
the other 101 come from queries Google anonymizes. The 472 non-branded
queries it reports (1,050 impressions, 0 clicks) are almost entirely word
count and page count questions, where pages rank on page 2 to 6.

| ID | Status | Type | Target query | URL | Why |
|---|---|---|---|---|---|
| B01 | live | new | how to write 50,000 words in a month | /learn/how-to-write-50000-words-in-a-month | Seasonal: November novel-writing month starts Nov 1. Daily-pace table (1,667/day), catch-up plans, links to the writing pace tool. Ship before Oct 31. |
| B02 | in PR (#41) | rework | X words is how many pages (250, 500, 1,000, 3,000, 10,000, 80,000...) | /learn/tools/word-count-to-pages | 7,864 impressions, positions 14 to 64, CTR 0.1%. Hundreds of "N words in pages" variants. Add a quick-answer table for common counts with anchor IDs, short-form counts (essays, short stories), single vs double spacing, **a US Letter / A4 toggle that defaults to Letter** (77% of the site's generative AI impressions come from outside English-speaking countries, led by A4 markets: Brazil, Indonesia, India), a title and description that match the query shape. Already the most-cited non-home page in Google's AI answers (645 of 2,538 impressions). One page, not one page per number. |
| B03 | todo | rework | how long is a novel / average novel length / book word count | /learn/tools/novel-length | 236 impressions at position 31 to 76. Strengthen the short answer, genre table with sources, debut vs established author ranges, FAQ. |
| B04 | todo | rework | best novel writing apps / best writing software for novelists | /writing-apps-breakdown | Ranks 36 to 84. Retitle for the query, refresh 2026 pricing on competitor sites, add a "best for" summary table at the top, FAQ. |
| B05 | todo | new | how to start writing a novel | /learn/how-to-start-writing-a-novel | Core positioning ("start writing in seconds"). Big beginner query; links to outline, character profile, and pace guides. |
| B06 | todo | new | how long should a chapter be | /learn/how-long-should-a-chapter-be | Classic answer-engine question. Genre ranges with sources, first chapter length, chapter count from word count. |
| B07 | todo | new | character profile template | /learn/character-profile-template | Template intent converts and earns links. Copyable template plus a filled example; complements the existing character profile guide. |
| B08 | todo | new | novel outline template | /learn/novel-outline-template | Same logic as B07, paired with the outlining guide. |
| B09 | todo | new | three act structure | /learn/three-act-structure | Highly quoted structure topic; worked example with percentages and page counts for an 80k novel. |
| B10 | todo | new | save the cat beat sheet | /learn/save-the-cat-beat-sheet | All 15 beats with page or word positions for common novel lengths. |
| B11 | todo | new | hero's journey | /learn/heros-journey | The 12 stages, with a novel-length worked example. |
| B12 | todo | new | how to write a first chapter | /learn/how-to-write-a-first-chapter | Pairs with B05 and B06. |
| B13 | todo | new | point of view in fiction (first person vs third person limited vs omniscient) | /learn/point-of-view-in-fiction | Evergreen craft question with clear comparison-table shape. |
| B14 | todo | new | how to write a synopsis for a novel | /learn/how-to-write-a-novel-synopsis | Querying writers need one; natural soft link to Compass Synopsis (never described as AI). |
| B15 | todo | compare | Obsidian for writing novels / Obsidian alternative for writers | /compare/obsidian | Already in compare-data.js with `pageUrl: null`. |
| B16 | todo | compare | Sudowrite alternative | /compare/sudowrite | Competitor positions itself as AI; may say so (attributed). Inkwell is never called AI. |
| B17 | todo | new | free Scrivener alternatives | /compare/scrivener-alternatives | High-intent shoppers; roundup, distinct from the Scrivener spoke. |
| B18 | todo | new | how to write dialogue | /learn/how-to-write-dialogue | Evergreen craft query; punctuation rules table. |
| B19 | todo | new | how to write a fantasy novel | /learn/how-to-write-a-fantasy-novel | Matches lore and codex features; hub for B20 and B21. |
| B20 | todo | new | how to create a magic system | /learn/how-to-create-a-magic-system | Strong fantasy-writer demand. |
| B21 | todo | new | worldbuilding questions | /learn/worldbuilding-questions | List-style, highly linkable; links to story bible guide. |
| B22 | todo | new | how to revise a novel | /learn/how-to-revise-a-novel | Supports "finish your novel" positioning. |
| B23 | todo | new | character arc types | /learn/character-arcs | Pairs with character profile guide. |
| B24 | todo | new | how to write a villain | /learn/how-to-write-a-villain | Popular craft question. |
| B25 | todo | new | how many words a day do authors write | /learn/how-many-words-a-day-do-authors-write | Quick-answer page; sourced author examples only; links to writing pace tool. |
| B26 | todo | compare | Novlr alternative | /compare/novlr | Listed in the apps breakdown, no spoke yet. |
| B27 | todo | compare | LivingWriter alternative | /compare/livingwriter | Same. |
| B28 | todo | compare | Ulysses for novel writing | /compare/ulysses | Same. |
| B29 | todo | new | story structures compared | /learn/story-structures | Hub page tying B09, B10, B11 and seven-point, Kishōtenketsu, Snowflake. |
| B30 | todo | new | show don't tell examples | /learn/show-dont-tell | Example-driven, quotable. |
| B31 | todo | new | how to write a romance novel | /learn/how-to-write-a-romance-novel | Largest fiction genre by readership. |
| B32 | todo | new | how to write a mystery novel (clues and red herrings) | /learn/how-to-write-a-mystery-novel | Planning-heavy genre; fits story bible and codex. |
| B33 | todo | new | pacing in fiction | /learn/pacing-in-fiction | Natural soft link to Compass Heartbeat (tension across the work). |
| B34 | todo | new | how to write subplots | /learn/how-to-write-subplots | Evergreen craft query. |
| B35 | todo | new | how to name characters | /learn/how-to-name-characters | Large query family. Method plus curated lists; not a "generator". |
| B36 | todo | new | series bible template | /learn/series-bible-template | Extends the book series guide. |
| B37 | todo | new | how to write a scene (scene and sequel) | /learn/how-to-write-a-scene | Pairs with outline template. |
| B38 | todo | glossary | novel writing terms | /learn/glossary | Grow from 59 to 100+ terms, each linking to the guide that covers it. |
