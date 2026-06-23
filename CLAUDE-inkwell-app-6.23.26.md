# Inkwell — CLAUDE.md

> This file gives Claude Code full context on the Inkwell project. Read it at the start of every session.

---

## What Is Inkwell?

Inkwell is a **minimalist, flow-first creative writing web app** — a "writing sanctuary" for novelists and storytellers. Think Scrivener's structure without the chaos. The core design philosophy is:

> **Remove all friction between idea and writing momentum.**

Inkwell is NOT a note-taking app, wiki, or productivity tool. Every decision should be evaluated through the lens of: *does this help writers write?*

**Tagline:** "All the structure of Scrivener. None of the chaos."

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite |
| Styling | Tailwind CSS |
| Editor | TipTap 3 (ProseMirror-based), content stored as JSON |
| Routing | React Router v7 |
| Backend/DB | Supabase (Postgres, Auth, Realtime, RLS) |
| Exports | JSZip + file-saver (EPUB), docx library (DOCX), custom PDF |
| Fonts | Lora (serif), Alegreya Sans (sans), Cinzel, Dancing Script |

---

## Deployment & Infrastructure

| Service | Platform | Notes |
|---|---|---|
| Frontend hosting | Vercel | Auto-deploys from `trlabarge/inkwell` on GitHub (main branch) |
| Database / Auth | Supabase | Project owned by the Inkwell Supabase org (claimed from Bolt May 2026) |
| Domain registrar | Namecheap | `inkwell.world` |
| App domain | `app.inkwell.world` | CNAME pointed at Vercel |

**Environment variables required in Vercel:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Supabase Auth configuration:**
- Site URL: `https://app.inkwell.world`
- Redirect URLs must include `https://app.inkwell.world`

---

## Project Structure

```
src/
  pages/          # Route-level page components
    ProjectsPage.tsx      # Project library / dashboard
    WritingPage.tsx        # Main editor (most complex page)
    SharedProjectPage.tsx  # Read-only shared project view
    SharedDocumentPage.tsx # Read-only shared document + comments
  components/     # Reusable UI components
  hooks/          # Custom React hooks
  lib/            # Utilities, Supabase client, export logic
supabase/
  migrations/     # SQL migration files (numbered, sequential)
```

---

## Database Schema (Supabase / Postgres)

### Core Tables

**`user_preferences`** — per-user settings
- `user_id` (PK, FK → auth.users)
- `theme` — `'light'` | `'dark'`
- `show_word_count`, `show_reading_time` (boolean)
- `editor_mode` — `'standard'` | `'focus'` | `'typewriter'`
- `daily_word_goal` (integer)

**`projects`** — top-level writing containers
- `id` (uuid PK), `user_id`, `title`, `description`
- `status` — `'active'` | `'archived'` | `'deleted'`
- `total_word_count` (rolled up from documents)
- `version` (integer — optimistic concurrency)
- `series_id` (uuid, nullable, FK → series) — optional grouping into a Series

**`series`** — optional grouping of projects on the dashboard (a "folder" of novels)
- `id` (uuid PK), `user_id`, `title`, `description`, `sort_order`
- Sits ABOVE projects (distinct from `folders`, which group documents within a project)
- Paid feature (Storyteller + Worldbuilder); enforced server-side by the
  `enforce_series_tier()` trigger. `projects.series_id` is `ON DELETE SET NULL`,
  so deleting a series un-groups its projects rather than deleting them.

**`documents`** — individual writing documents
- `id`, `project_id`, `user_id`, `title`
- `content` (jsonb — TipTap/ProseMirror JSON format)
- `word_count` (server-calculated)
- `sort_order` (integer — ordering within project)
- `version` (integer — optimistic concurrency)

**`document_versions`** — rolling history for rollback
- `document_id`, `version`, `content` (jsonb snapshot), `author_id`
- As of migration 056 the auto-snapshot trigger is **gated**: a new rolling row is
  only inserted once ≥ 15 min have passed since the last snapshot OR word count
  has moved ≥ 100 words, so the last-20 buffer spans hours/days of editing instead
  of being burned through in one sitting.

**`document_daily_snapshots`** — long-horizon recovery tier (migration 056)
- One row per document per UTC day, upserted on every save (holds that day's
  latest content), retained 180 days. The tier the rolling buffer can't provide
  ("get this chapter back to where it was last Tuesday").
- Restores go through `restore_document_version()` (SECURITY DEFINER RPC), which
  snapshots the about-to-be-discarded content first, so a restore is never a
  one-way door. Both snapshot tiers are **free for every plan** — a trust/safety
  feature, not a capacity lever (same principle as free-tier export).

**`text_links`** — the Story Graph index (inline StoryLink marks, normalized)
- `document_id`, `project_id`, `user_id`, `target_id`, `target_type`
  (`'character' | 'lore_entry'`), `linked_text`
- **Derived, not hand-maintained.** As of migration 037 it is a server-side
  PROJECTION of the inline `storyLink` marks in `documents.content`: a trigger
  (`sync_text_links_for_document`) re-derives a document's rows from its content
  on every save (same pattern as `word_count`). The inline marks remain the
  single source of truth. Do NOT write `text_links` from the client — that was
  the old, drift-prone approach (it over-deleted on unlink and never synced
  edits/paste/offline). It backs the Mention Index ("Appears in") and is the
  substrate for future Story Intelligence features (relationship map, etc.).

**`lore_categories`** — worldbuilding category containers
- Unique constraint: `(project_id, name)` — no duplicate categories per project
- `hidden_fields` (text[]) — built-in/template field keys the writer has "deleted"
  (hidden) for this category. Hiding preserves the underlying `lore_entries`
  column data, so it is reversible (migration 036).

**`character_categories`** — customizable folders for grouping characters
- Mirrors `lore_categories` (name, icon, description, is_default, sort_order)
- `characters.category_id` FK is `ON DELETE SET NULL` — deleting a folder
  un-groups its characters (moves them to "Uncategorized") rather than deleting
  them. Characters are shown grouped under collapsible category headers in the
  codex sidebar (migration 036).

**Custom / deletable fields** — both characters and lore support a flexible field
system on top of their built-in template fields:
- Lore custom fields are **per-category** (`lore_category_fields` +
  `lore_entry_field_values`).
- Character custom fields are **project-scoped / shared** by all characters
  (`character_fields` + `character_field_values`) — the "folders only" model.
- Built-in fields can be hidden ("deleted") and restored on both: lore via
  `lore_categories.hidden_fields`, characters via `character_field_settings`
  (one row per project). The title/name field is never deletable.

### Key Schema Rules
- Always use `version` field for optimistic concurrency — never skip this on writes
- `content` in documents is always TipTap JSON, never raw HTML or plain text
- Word counts are server-calculated, not client-estimated
- Old daily-goal tables were removed (migration 015); the goal system was rebuilt on the `writing_goals` table (migration 030)

---

## Key Components & Hooks

### Pages
- **`WritingPage`** — the heart of the app. Manages: editor state, codex/sidebar, focus mode, command palette, onboarding nudges, keyboard shortcuts, writing goals, sharing. Very large file — be careful with changes here.
- **`ProjectsPage`** — project library. Handles create/rename/delete/backup.

### Important Hooks
- `useDocument` — document CRUD, autosave, versioning
- `useDocumentSnapshots` — reads the two server-side snapshot tiers (gated rolling
  `document_versions` + long-horizon `document_daily_snapshots`), merges them into
  one newest-first timeline, and restores via `restore_document_version` (backs the
  account-portal Backups tab)
- `useUserPreferences` — theme, settings (dark/light via `isDark`)
- `useCodexCache` — caches characters/lore for performance
- `useKeyboardShortcuts` — all keyboard shortcut bindings
- `useOnboardingNudge` — contextual nudge state (100+ words, 6s pause)
- `useShortcutsNudge` — shortcut education nudge
- `useGoalNudge` — one-time "set a writing goal" discovery nudge (400+ words, fires only when no goal is set and no other nudge is showing; persisted via `onboarding_goal_nudge_dismissed`)
- `useMilestoneCelebration` — in-flow word-milestone celebrations (Phase 1c). Pure decision core in `lib/milestones.ts`; reads cumulative **authored** words, fires `milestone_celebrated`, routed through the arbiter.
- `useAuthoredWordTotal` — cumulative authored-words baseline (from `writing_days`) feeding the milestone celebrations
- `useWritingStreak` — current/longest active-day streak (from `writing_days`), shown on the Mantel
- `useFirstDraftChallenge` — reads `challenge_progress` + `writing_days`, derives challenge state via `firstDraftChallenge.ts`, fires the challenge analytics + in-widget celebration (display only; rewards granted server-side)
- `useEarnedBadges` / `useCraftBadges` / `useBadgeCelebration` — badge state + celebration (see `docs/achievements-badges-spec.md`)
- `useFocusMode` — focus mode state
- `useWritingGoal` — writing goal tracking
- `useWritingAnalytics` — paid "Your Writing Life" analytics: reads the shared `useWritingDays` fetch and derives word trends (week/month/year), the heatmap grid, and lifetime stats via `writingAnalytics.ts` (pure). No extra query.
- `useGoalDashboard` — fetches active `writing_goals` + `projects` and derives per-project goal progress via `goalDashboard.ts` (pure)

### Key Libraries (`src/lib/`)
- `contentConverter.ts` — converts TipTap JSON ↔ HTML ↔ plain text
- `epubExport.ts` — EPUB generation
- `projectBackup.ts` — full project export (JSON, Markdown, DOCX)
- `platform.ts` — OS detection for shortcuts (`SHORTCUTS` constant)
- `loreTemplates.ts` — lore entry field templates by category
- `analytics.ts` — analytics event tracking (incl. the Phase 0 activation funnel events)
- `activation.ts` — fires the activation funnel milestones (`first_word_written`, `activation_reached` at 300 words), deduped per-user; wired into `Editor.tsx`
- `firstLineSeeds.ts` — first-line "blank-page warming" seed pool + session-stable picker (`getSessionFirstLineSeed`)
- `notificationArbiter.ts` — single source of truth for which ambient nudge may show (`celebration > character > shortcuts > goal`)
- `milestones.ts` — pure decision core for in-flow milestone celebrations (`reduceMilestone`, `MILESTONES`); ladder starts at 1,000 and supports an `isSuppressed` predicate so a threshold can yield to another surface (the FDC owns 10k) without being marked earned
- `authoredWords.ts` — edit-time authored-words tracker (excludes pastes/imports), batched to the `record_authored_words` RPC → `writing_days`
- `streaks.ts` / `badges.ts` / `craftBadges.ts` / `userBadges.ts` — streak + badge/Mantel logic (see `docs/achievements-badges-spec.md`)
- `writingAnalytics.ts` — pure decision core for the paid Writing Analytics tab (word history + prior-period deltas, daily/monthly `periodSeries` for the trend bars, 12-month heatmap with fixed thresholds + the hidden `HEATMAP_GOLD_THRESHOLD`, lifetime `computeWritingStats`). See `docs/writing-analytics-spec.md`.
- `goalDashboard.ts` — pure core for the multi-project goal dashboard (`computeGoalProgress`, `periodHasReset`), mirroring `useWritingGoal`'s per-project math
- `firstDraftChallenge.ts` — pure decision core for the First Draft Challenge (window math, word/active-day totals, reward ladder, status); display only — rewards are granted server-side (migration 048)
- `entitlements.ts` — tier definitions + resolution. `resolveTierWithGrants` folds in promotional comps from `subscription_grants` (challenge rewards), taking the best of {paid sub, active grant}; mirrors the SQL `effective_tier()`

---

## Feature Overview

### Currently Implemented
- **Manuscript binder** — nested documents with drag/drop reordering (`sort_order`)
- **TipTap editor** — rich text, formatting toolbar, story link extension (inline character/lore links)
- **Codex (sidebar)** — tabbed: Characters, Lore, Outline
- **Character templates** — structured character profiles. Characters can be
  organized into customizable, collapsible categories/folders in the codex
  sidebar, mirroring the manuscript binder's folders: create a category inline
  ("New Category"), rename/delete it in place, and drag characters between
  categories (or to "Uncategorized"). Right-click a character to Rename/Delete,
  and drag to reorder within the list. Category folders themselves can also be
  reordered by dragging their headers. The profile also has a Category selector
  (useful on mobile). Built-in fields are deletable (hidden, reversible) and
  writers can add project-wide custom fields.
- **Lore/worldbuilding templates** — categories: Location, Organization, History & Events, Magic & Technology Systems, etc. The lore sidebar is an expandable tree: expand a category to see its entries inline and open one directly (no need to click into the category first). Right-click an entry to Rename/Delete, and drag to reorder or move entries between categories. Category folders can be reordered by dragging their headers. Any field (built-in template field or custom field) can be deleted; built-in deletions are reversible via the "Hidden Fields" restore panel.
- **Story outline system** — a **corkboard grid** of cards (one per document), with
  zoom, drag-to-reorder, and cross-folder drag — all kept in sync with the
  manuscript binder's `sort_order`. `OutlineContentArea.tsx`.
- **Focus mode** — distraction-free writing, fully functional (all shortcuts/nudges work inside it)
- **Command palette** — `Cmd/Ctrl+P`, access to all actions
- **Keyboard shortcuts** — nav, creation, system actions (Mac: ⌘, Windows: Ctrl, with Ctrl+Alt+Arrow for navigation to avoid conflicts)
- **Onboarding nudges** — contextual, non-modal, auto-dismissing
- **Activation funnel (Phase 0)** — PostHog instrumentation of the full funnel (`signup → project_created → first_word_written → activation_reached` at 300 words → day-2 return), with set-once person properties for cohorting. `lib/activation.ts` + `lib/analytics.ts`.
- **Blank-page warming (Phase 1)** — a faint, session-stable first-line seed shown on a new writer's empty first document, vanishing on first keystroke. `lib/firstLineSeeds.ts`. See `docs/onboarding-activation-spec.md` §2.
- **In-flow milestone celebrations (Phase 1)** — warm, auto-dismissing toasts at 1k / 2k / 5k / 10k+ (logarithmic cadence), reading **authored** words (typed in Inkwell, not pasted). The "first word" rung was dropped (a single keystroke is too noisy to celebrate), so the ladder starts at 1,000. The 10k toast yields to the First Draft Challenge while that challenge is still winnable (`active`) or won (`completed`) — the challenge widget owns that moment — and fires normally once the challenge has `expired` or the writer was never enrolled (threaded as an `isSuppressed` predicate through `reduceMilestone`). `lib/milestones.ts` + `useMilestoneCelebration` + `Celebration.tsx`.
- **Notification arbiter (Phase 1)** — at most one ambient surface at a time (`celebration > character > shortcuts > goal`); lower-priority nudges defer rather than stack. `lib/notificationArbiter.ts`.
- **Authored-words tracking + streaks + badges/Mantel (Phase 2 foundation)** — edit-time authored-words capture (excludes paste/import) into the owner-read-only `writing_days` table; active-day streaks and the badge/Mantel system built on top. `lib/authoredWords.ts`, `lib/streaks.ts`, `lib/badges.ts`, `components/account/Mantel.tsx`. See `docs/achievements-badges-spec.md`.
- **Writing goals** — session/daily/weekly goals on the `writing_goals` table (migration 030); ring UI + goal panel, presets/custom target, pause/resume/reset, auto period reset, works in Focus Mode. Available to all tiers (not entitlement-gated). The dormant ring brightens on hover with a "Set a writing goal" label, and a one-time `GoalNudge` pill introduces it once the writer shows intent.
- **Word count + reading time** — live, toggleable
- **Serif/sans font toggle**
- **Dark mode** (full coverage)
- **Export** — PDF, DOCX, EPUB
- **Project backup** — JSON, Markdown, DOCX full backup. Surfaced in the account
  portal's **Backups tab** (`BackupsSection.tsx`), redesigned around project-wide
  assurance (not a per-document hunt), alongside per-document version recovery from
  the two server-side snapshot tiers (see `useDocumentSnapshots` / migration 056)
- **Sharing** — permission-based, scoped access for projects and documents
- **Shared document comments** — general (non-anchored) feedback via `Send` button (`useShareComments.ts` + `CommentsPanel.tsx`)
- **Inline comments ("Margin Notes")** — Google-Docs-style anchored comments on shared documents: a beta reader selects a span and attaches a comment to that exact text; the author later reviews them anchored to the prose. Comments attach to a **frozen snapshot** taken when the share was created (they do NOT flow into the still-being-edited project). Coexists with the bottom-of-page general feedback box. MVP is single-comment-per-highlight (no threaded replies/resolve yet). `CommentableDocumentEditor.tsx`, `useInlineComments.ts`, `lib/extensions/commentHighlight.ts`, migrations 054–055. See `docs/inline-comments-spec.md`.
- **Multi-project library** — ProjectsPage with archive/delete/rename
- **Mention Index ("Appears in")** — the first Story Intelligence feature.
  In a character/lore codex panel, shows which documents the entry appears in,
  aggregated to the document level ("Appears in X of Y documents"), with a
  density-gradient presence strip (soft green = linked, blue light→dark = few→many
  mentions), first/last anchors, and a collapsed-by-default list (CTA "See where
  this character appears") of direct document links. Presence is the **union of
  linked + named**: explicit StoryLinks (`text_links`) PLUS prose name/alias
  occurrences with counts (`entity_document_mention_counts` RPC, migrations
  038→039 — case-sensitive, whole-word, **names only, never pronouns**).
  Deterministic ($0, no AI), free tier. Uses "documents," never "chapters." See
  `docs/mention-index-spec.md`.
- **Editorial Insight ("A Closer Read")** — a calm, on-demand panel opened from a
  whisper-quiet bar-graph button beside the writing-goal ring (or command palette
  → "Writing Insights"), with gentle, descriptive stats for the current document:
  words/sentences, avg & longest sentence, reading time, reading ease (Flesch),
  dialogue share, adverb (-ly) and filler-word density. Deterministic ($0, no AI),
  computed locally from the document text. **Descriptive, never judgmental** —
  "just observations, no rules" (Doctrine §2.6). **Storyteller+** (free writers
  get a calm `UpgradePrompt`). `lib/editorialInsight.ts` + `InsightsPanel.tsx`.
- **Writing Analytics ("Your Writing Life")** — the paid (**Storyteller+**) insight
  layer over the writing-habit data, surfaced in the account portal. The free habit
  layer (**The Mantel** — streak + badge gallery) is now its **own account tab**, so
  analytics aren't buried beneath it. The analytics tab shows: **word trends** (a
  week/month/year toggle over a responsive bar chart, with the headline total + a
  fair "vs. prior period" delta; hovering a bar gently rises the day's word count
  out of the top, zen-style); **By the numbers** (total words, total active days,
  best day, avg/active day); a **12-month calendar heatmap** (responsive — fills the
  width, no scroll; calm amber ink ramp on fixed thresholds, with a hidden **gold**
  tier at 2,500+ words that's absent from the legend — a happy discovery + a
  shareable flex); and a **multi-project goal dashboard**. Account-wide by design
  (`writing_days` has no `project_id`). Read-only over existing data — no new write
  paths, no AI, $0. Free writers see a "Part of Storyteller" perk card (no data
  fetched). `lib/writingAnalytics.ts` + `lib/goalDashboard.ts` + `useWritingAnalytics`
  / `useGoalDashboard` + `components/account/analytics/*`. See
  `docs/writing-analytics-spec.md`.

### Launch Status
See `docs/launch-checklist.md` for the current pre-launch punch list and the
Fast Follow roadmap (Writing Analytics, AI Story Intelligence, Worldbuilder).
Account deletion (GDPR right-to-erasure) has since **shipped** (migration 053);
badge artwork is wired up. Stripe go-live remains the main open launch item.
A user-facing **account portal** (`/account` route, `AccountPage.tsx`) is built
on the frontend (Subscription / Profile / Security / Backups / The Mantel / Your Writing Life tabs);
its Stripe billing backend is still being wired. See `docs/account-portal.md`.

### Planned / In Progress
- **Connected Storytelling / Story Graph** — cross-linking characters/lore within prose (StoryLink extension exists; now normalized into the derived `text_links` index, which powers the Mention Index and the broader Story Intelligence roadmap)
- **Story Intelligence (AI) roadmap** — full strategy, tiering, costs, and the build order in `docs/ai-strategy.md`; first build (Mention Index) spec in `docs/mention-index-spec.md`. See the doctrine summary below before building any AI feature.
- **Typewriter mode** — `editor_mode` exists in schema, not yet fully implemented
- **Advanced collaboration** — `pending_operations` table scaffolded for offline/sync
- **Achievements / streak badges** — ✅ shipped (kept free, see Goals & Achievements Strategy below): active-day streaks (`streaks.ts`) and the badge/Mantel system (`badges.ts`, `craftBadges.ts`, `Mantel.tsx`).
- **Writing Analytics (Storyteller+)** — ✅ shipped: the paid analytics layer (word trends, multi-project goal dashboard, calendar heatmap, lifetime stats) in the "Your Writing Life" account tab. See the feature entry above and `docs/writing-analytics-spec.md`. **Goal completion history** (a look-back log of goals you've hit) is the next deferred piece — needs a new capture path; specced in `docs/goal-history-spec.md`.
- **First Draft Challenge** (public name: **"Start Your Story"**) — ✅ shipped. Auto-enrolled (signup trigger + backfill of existing free users), clock starts on first word, the 10k-words-in-5-active-days (within 14 days) mechanic, milestone reward ladder, server-side auto-grant, and an ambient progress widget. Rewards grant into the self-expiring `subscription_grants` overlay. The user-facing copy says "Start Your Story"; internal table/analytics names stay `first_draft_challenge`. `lib/firstDraftChallenge.ts`, `useFirstDraftChallenge.ts`, `FirstDraftChallengeWidget.tsx`, migrations 047–048 (active-day gate later reduced 7→5 in migration 050). See `docs/onboarding-activation-spec.md` §4.

---

## Product & UX Principles

These are non-negotiable. Always evaluate features against them.

### Core Philosophy
1. **Flow first** — never interrupt a writer mid-thought. No modals while writing. No disruptive loading states.
2. **Invisible UX** — interactions should feel native-app fast ("melted butter" standard). No flicker, no remounts, no loading spinners for local interactions.
3. **Progressive disclosure** — don't show features until they're relevant. Teach at the moment of need.
4. **Start writing in 10 seconds** — "New Project" → Chapter 1 → writing. Zero setup friction.

### Onboarding Rules
- No templates menus, genre pickers, or setup wizards on first launch
- Blank-page warming: a single faint first-line seed on the empty first document, vanishing on first keystroke (never a modal/overlay)
- Character creation nudge: triggers at 100+ words + ~6s typing pause — subtle, non-modal, auto-dismisses, shown once
- Shortcut nudge: triggers after first document created — auto-dismisses in 6–8s
- In-flow celebrations: warm, auto-dismissing milestone toasts (first word / 1k / 2k / 5k / 10k+) on **authored** words — never gamified-cheesy, never modal
- **One ambient surface at a time:** all nudges/celebrations route through the notification arbiter (`celebration > character > shortcuts > goal`). Never surface a new ambient nudge without going through it.

### Performance Standards ("Melted Butter")
- Optimistic UI for all local state changes
- Cache codex data in `useCodexCache` — never re-fetch on every tab switch
- Prevent component remounts when switching codex tabs or documents
- Preserve editor state and scroll position on navigation
- No visible loading states for interactions that are locally available
- No global re-renders from isolated state changes

### Theming
- Theme is always `preferences.theme === 'dark'` → derive `isDark` boolean
- Pass `isDark` as a prop — do not re-read preferences inside leaf components
- All components must fully support dark + light mode

---

## Keyboard Shortcuts

Defined in `src/lib/platform.ts` as `SHORTCUTS` constant. OS-aware.

| Action | Mac | Windows |
|---|---|---|
| Next document | ⌘→ | Ctrl+Alt+→ |
| Previous document | ⌘← | Ctrl+Alt+← |
| New document | ⌘N | Ctrl+N |
| New character | ⌘Shift+C | Ctrl+Shift+C |
| New lore entry | ⌘Shift+L | Ctrl+Shift+L |
| Focus mode toggle | ⌘. | Ctrl+. |
| Command palette | ⌘P | Ctrl+P |

**Rules:**
- Windows uses `Ctrl+Alt+Arrow` for document nav to avoid conflict with word navigation
- UI tooltips show native platform labels (no "Cmd/Ctrl" hybrid)
- All shortcuts must work in Focus Mode

---

## Strategic Direction

### Connected Storytelling (Key Differentiator)
- Users highlight character/lore names → link inline to codex entries
- `StoryLinkPanel` and `StoryLinkTarget` exist in codebase
- Internally functions as a lightweight story graph
- Public positioning: "Your story stays connected" — NOT marketed as a wiki or graph product
- Creates competitive moat, enables future AI/contextual features

### Story Intelligence (AI) — Doctrine (read before building any AI feature)
Full detail in `docs/ai-strategy.md`. The non-negotiables:
1. **It never writes the manuscript.** No prose, autocomplete, ghost text, or
   "rewrite this." Output is always *about* the writing (notes, questions, maps,
   answers), never *in* it. This is the bright line vs. Sudowrite/NovelAI.
2. **User words are never used to train AI**, and are never stored by a provider.
   Launch on **Anthropic API direct** ("never trained on, deleted within 7 days"),
   behind a thin provider-abstraction; migrate to **Claude-via-AWS-Bedrock** later
   for the absolute "never stored" pledge.
3. **Reflective, not generative** — it reads what the writer made and reflects it
   back (summaries, retrieval, analysis, maps).
4. **Don't call it "AI."** Never brand features as "AI"/"AI-powered" anywhere in
   app or marketing; name by outcome. The *only* allowed use of the word "AI" is
   the trust pledge (what we will never do with it). Umbrella term: "Story
   Intelligence."
5. **Pull, don't push. Describe, don't judge. Never assume intent.** Every
   checking feature is a panel the writer opens; findings are framed as questions
   ("is this intentional?"), never ambient error flags. We facilitate creation,
   never police it.

**Tiering:** Inkling (free, metered taste — 10 Ask + 5 synopses/mo) → Storyteller
(active-writing companion) → Worldbuilder (deep analysis, the graph, and the
heavy whole-manuscript/series scans). **Build order:** cheap deterministic wins
first (Mention Index ✓ shipped), then the retrieval layer, then metered LLM
reflection. See `docs/ai-strategy.md` §8.

### Inkwell vs. Scrivener
- Scrivener: powerful but overwhelming, dated UX
- Inkwell: modern, instant, fluid — structured without friction
- Do not copy Scrivener's feature surface; solve the same problems more elegantly

---

## What NOT To Do

- **Never mutate TipTap content directly** — always use TipTap editor commands/transactions
- **Never skip `version` on document/project writes** — required for optimistic concurrency
- **Never add setup friction before writing** — no wizards, genre pickers, or required fields on project creation
- **Never add loading spinners for locally-cached interactions** — use optimistic updates
- **Never interrupt the writing flow** — no full-page modals while the editor is active
- **Never show duplicate lore categories** — unique constraint exists at DB level and should be handled gracefully in UI
- **Daily goal tables are gone** — do not reference `daily_writing_stats` or `document_daily_baselines`
- **Do not aggressively add features** — prioritize responsiveness, smoothness, and flow over feature count

---

## Development Notes

- Supabase client is in `src/lib/supabase.ts`
- All DB queries use Supabase JS client with RLS — never bypass RLS
- Migrations are numbered sequentially (`001_`, `002_`, ...) — always add new migrations at the end. As of this writing the latest is `056` (tiered document snapshots — gated rolling buffer + 180-day daily snapshots + `restore_document_version`); recent additions include the active-project lock (049), the FDC 5-active-day tuning (050), share-token / authored-words / account-deletion hardening (051–053), and the inline comments system (054–055)
- `analyticsEvents` in `src/lib/analytics.ts` — call for significant user actions
- The `WritingPage` component is large and has many interdependent state pieces — isolate changes carefully

---

## Database Migrations — Deploy Pipeline

Migrations are applied to the production Supabase database **automatically by CI** —
not by Vercel, and not by hand.

- **Workflow:** `.github/workflows/deploy-migrations.yml` runs `supabase db push`
  on every push to `main` that touches `supabase/migrations/**` (i.e. after a PR
  merges). It also has a manual `workflow_dispatch` trigger.
- **Required repo secrets:** `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`,
  `SUPABASE_PROJECT_ID` (set in GitHub → Settings → Secrets and variables → Actions).
- **Vercel and the migration workflow are independent** and run in parallel on
  merge. The app degrades gracefully if a migration lags the frontend (e.g.
  `useSubscription` falls back to the free tier), but the safe mental model is:
  schema changes land via the workflow, frontend lands via Vercel.
- **The workflow runs on `main` as a push event — it is NOT a PR check.** Don't
  expect it on the PR; confirm it in the Actions tab ("Deploy Supabase migrations")
  after merge.

### ⚠️ Never re-run an already-applied migration / no duplicate migration files
`supabase db push` tracks applied versions in `supabase_migrations.schema_migrations`
on the remote DB. Two gotchas that have already bitten us:

- **Duplicate-numbered files** (a Bolt artifact — the repo once had two `004` and
  two `009` files with near-identical timestamps). The remote only recorded one of
  each, so the unrecorded twin showed up as an "out-of-order pending migration" and
  **failed the deploy**. Fix was to delete the orphan duplicates so local matches
  the remote history. Keep migration filenames/versions unique.
- **Do NOT "fix" an out-of-order error with `--include-all`.** That re-executes the
  flagged files. Migration `004` creates daily-goal tables that `015`/`016` later
  dropped — re-running it would resurrect dead tables. When history is out of sync,
  prefer removing genuine duplicates, or `supabase migration repair --status applied
  <version>` to reconcile without executing.
- **Don't apply a migration by hand in the SQL Editor and also let CI push it** —
  manual application isn't recorded in `schema_migrations`, so `db push` will try it
  again and fail on non-idempotent statements (`CREATE POLICY`, `CREATE TRIGGER`).
  Let the workflow be the single path that applies migrations.

---

## Business Model & Pricing

### Goal
Lifestyle SaaS business. Personal net income target: **$200k–$250k/year**.
Early validation milestone: **$50k ARR** (~350–450 paying users).
Long-term lifestyle goal: **~$250k+ ARR** (~1,500–2,500 paying users blended across tiers).

### Pricing Tiers

| Tier | Price | Target User |
|---|---|---|
| **Inkling** | Free | Casual / trying it out |
| **Storyteller** | $9/mo | Most active writers — primary conversion target |
| **Worldbuilder** | $19/mo | Fantasy writers, lore-heavy projects, series writers |

### What Each Tier Includes

**Inkling (Free)**
- 1 **editable** project at a time — the writer's chosen "active" project. If a
  paid window lapses (cancellation or an expired First Draft Challenge grant)
  leaving several projects, the others go **read-only but stay exportable**; the
  writer picks which one is active, or upgrades. Enforced server-side by
  `can_edit_project()` (migration 049); mirrored client-side in `lib/projectAccess.ts`.
- Basic editor
- Limited AI usage
- TXT + Markdown export only
- Restricted: advanced exports (DOCX/PDF/EPUB), advanced AI, multiple projects, advanced org systems

**Storyteller ($9/mo)**
- Everything in Inkling
- Multiple projects
- Full export formats (DOCX, PDF, EPUB, manuscript-ready)
- Full AI usage

**Worldbuilder ($19/mo)**
- Everything in Storyteller
- Relationship mapping, advanced lore systems
- Timelines, series management
- Story intelligence features
- Must feel like genuinely deeper capabilities — NOT "same product with more storage"

### Export Strategy
- Free tier gets TXT/Markdown — writers must never fear losing their work (trust is critical)
- Paid tiers get DOCX, PDF, EPUB, manuscript-ready formatting
- Do NOT lock users out of basic export — it kills signup conversion

### Writing Goals & Achievements Strategy

**Decision: the core writing-goal feature is free for ALL tiers (including Inkling), and is intentionally NOT entitlement-gated.** Do not reflexively put it behind a paywall.

Rationale:
- Goals are a **retention / habit-loop mechanism**, not a capacity lever. Gating the habit throttles the exact engagement that converts free → paid.
- Consistent with the export principle — don't put friction between a writer and their own progress.
- The free tier is already fenced by the **1-project limit**, which is the real conversion wall. A serious multi-book writer hits *that* first.
- Goals are near-zero marginal cost (one row per active goal, no AI/storage burden), so giving them away makes the free tier feel generous and drives word-of-mouth.

If goals should ever also pull weight as a paid lever, **split the feature rather than gating the core**:

| Free (Inkling) | Paid (Storyteller+) |
|---|---|
| Session / daily / weekly goal, the ring, pause/reset | Goal & streak **history** |
| **Achievements / streak badges** (hitting goals, streak milestones) | Multi-project goal **dashboard** |
| | Calendar **heatmap** |
| | Streak / goal **analytics** |

- **Achievements stay free.** They're a motivation/dopamine hook that reinforces the habit loop — same logic as keeping goals free. They belong on Inkling.
- **The insight & accountability layer is the paid upgrade** — history, dashboard, heatmap, analytics. That's the part power-users will actually pay for, and it leans naturally into the Storyteller+ "deeper capabilities" promise.

This split is net-new feature work; today only the free core exists.

---

## Activation & Retention Strategy

### The True Activation Metric
A user who writes **300–500 words** in their first session is the strongest predictor of retention. Everything in onboarding should drive toward this.

### Recommended Onboarding Flow
1. No empty states — immediately guide into starting a story
2. 3-step guided setup: story type → premise → tone/style
3. Auto-create Chapter 1, pre-fill opening lines, drop user straight into editor
4. After initial writing progress: progressively unlock outlining, characters, lore/worldbuilding (features earned, not front-loaded)

### First Draft Challenge / "Start Your Story" (Onboarding Incentive)
Reward for early engagement — designed to create habit + emotional investment.
Public-facing name is **"Start Your Story"**; internal names stay `first_draft_challenge`.

**Core offer:** Write **10,000 words across 5 active days within 14 days** → unlock **1 free month of Storyteller**

Rationale:
- 10k words = meaningful chunk of a novel; user has created characters, lore, chapters — switching feels like loss
- A multi-day spread prevents one-session "word dumps" and reinforces habit formation (the active-day gate was tuned down 7→5 in migration 050 to keep the challenge a gift, not a grind)
- Not so high (25k+) that it feels like a challenge instead of a gift

**Milestone progression (revised — "10k for a free month or bust"):**

| Milestone | Reward |
|---|---|
| 2,500 words | Cosmetic celebration only (no reward) |
| 10,000 words (+ ≥ 5 active days) | **1 month of Storyteller free** — the one reward |
| 25,000 words (+ ≥ 5 active days) | Founder badge (`the_vanguard`) — recognition, no subscription reward |

> The original four-rung ladder (incl. a 5,000-word free week) was collapsed:
> the single subscription reward is the free month at 10k, the threshold where a
> writer commits to the story. See `docs/onboarding-activation-spec.md` §4.2.

**Progress visibility is critical:**
- Floating progress widget, live word count toward milestone
- Streak indicators, milestone celebrations
- Motivational messaging throughout
- All project words count automatically — no manual submission friction

### Why Writers Stay (The Real Moat)
The moat is NOT "best AI." The moat is: **writers feel more motivated and organized inside Inkwell than anywhere else.**

Stickiness comes from:
- Accumulated writing progress stored in Inkwell
- Characters, lore, worldbuilding embedded in the platform
- Habit formation from daily use
- Emotional investment in projects built here

Once a writer has 20k+ words, 10 characters, and a full lore system inside Inkwell — leaving feels psychologically and operationally hard.

---

## Go-To-Market Strategy

### Product Positioning
Inkwell is **"the best place to actually finish your novel"** — NOT an AI writing tool.

AI is assistive and momentum-enhancing. It should never feel like "AI writes your book for you." The positioning is about:
- Momentum
- Structure
- Organization
- Finishing stories

### Primary Acquisition Channels (Priority Order)

1. **Reddit** — primary early channel
   - Communities: r/writing, r/fantasywriters, r/selfpublish, r/screenwriting
   - Strategy: show workflows, share demos/screenshots, no overt promotion
   - Expected: 60–150 paying users/month with strong execution

2. **SEO** — long-term compounding
   - Content: writing guides, outlining templates, worldbuilding resources, "Scrivener alternative" comparisons
   - Timeline: 6–12 months to meaningful organic traffic flywheel

3. **Build-in-Public / Social** — brand + community
   - X/Twitter, TikTok, short-form demos
   - Supports Reddit + SEO, not a standalone channel

4. **Templates & Lead Magnets** — signup acquisition
   - Examples: fantasy world bible, romance plot template, character arc builder
   - Used for email capture and onboarding conversion

### Biggest Failure Risks
- Writers abandon projects frequently — retention is the hardest problem
- AI novelty fades if product becomes AI-dependent
- Overbuilding features before nailing onboarding + retention
- Weak churn economics if activation milestone isn't hit early

### Near-Term Priorities (in order)
1. Nail onboarding + activation (300–500 word first session)
2. Build the First Draft Challenge / milestone system
3. Reddit content engine
4. SEO foundation
5. Iterative onboarding optimization based on data

**Do not prioritize:** feature count, AI sophistication, or GTM breadth before activation is solved.
