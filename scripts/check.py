#!/usr/bin/env python3
"""Guardrail checks for the Inkwell marketing site.

Not part of the site and never deployed: a pre-PR sanity check that the
brand, SEO, and link rules in CLAUDE.md hold. Standard library only.

    python3 scripts/check.py            # check every page
    python3 scripts/check.py learn/x.html compare/y.html   # check only these

Exits 1 if any ERROR is found. WARN lines are for review, not blockers.
"""

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APEX = "https://inkwell.world"
CTA = "https://app.inkwell.world/auth"

# Pages that describe other companies' products. Competitors may be called
# "AI" here when that is how they position themselves (see CLAUDE.md).
COMPETITOR_PAGES = ("compare/", "writing-apps-breakdown.html")
# Legal pages: home of the sanctioned privacy pledge about what Inkwell will
# never do, and the only pages that name the app's domain in prose.
AI_ALLOWED_PAGES = ("privacy.html", "terms.html")

SKIP_TEXT_TAGS = {"script", "style", "svg"}


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.meta = {}
        self.links = []
        self.canonical = None
        self.title = ""
        self.text = []
        self.jsonld = []
        self._stack = []
        self._in_title = False
        self._in_jsonld = False
        self._buf = []
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self._stack.append(tag)
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            key = a.get("name") or a.get("property")
            if key:
                self.meta[key] = a.get("content", "")
        elif tag == "link" and a.get("rel") == "canonical":
            self.canonical = a.get("href")
        elif tag == "a" and a.get("href"):
            self.links.append(a["href"])
        elif tag == "script":
            if a.get("type") == "application/ld+json":
                self._in_jsonld = True
                self._buf = []
            if a.get("src"):
                self.scripts.append(a["src"])
        for attr in ("alt", "aria-label", "title"):
            if a.get(attr):
                self.text.append(a[attr])

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "script" and self._in_jsonld:
            self.jsonld.append("".join(self._buf))
            self._in_jsonld = False
        if tag in self._stack:
            while self._stack and self._stack.pop() != tag:
                pass

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_jsonld:
            self._buf.append(data)
            return
        if not any(t in SKIP_TEXT_TAGS for t in self._stack):
            self.text.append(data)


def url_for(rel):
    """Clean URL for a file path relative to ROOT."""
    p = rel.removesuffix(".html")
    if p == "index":
        return APEX + "/"
    p = p.removesuffix("/index")
    return f"{APEX}/{p}"


def resolves(href):
    """Does an internal, extensionless href map to a file under cleanUrls?"""
    path = href.split("#")[0].split("?")[0].strip("/")
    if not path:
        return True
    cand = [ROOT / path, ROOT / f"{path}.html", ROOT / path / "index.html"]
    return any(c.is_file() for c in cand)


def sitemap_urls():
    xml = (ROOT / "sitemap.xml").read_text()
    return set(re.findall(r"<loc>(.*?)</loc>", xml))


def main(argv):
    all_pages = sorted(
        p.relative_to(ROOT).as_posix()
        for p in ROOT.rglob("*.html")
        if not any(part.startswith(".") for part in p.relative_to(ROOT).parts)
    )
    targets = [a for a in argv if a.endswith(".html")] or all_pages

    errors, warns = [], []
    err = lambda f, m: errors.append(f"ERROR {f}: {m}")
    warn = lambda f, m: warns.append(f"WARN  {f}: {m}")

    sitemap = sitemap_urls()
    llms = (ROOT / "llms.txt").read_text() + (ROOT / "llms-full.txt").read_text()
    titles, descs = {}, {}

    for rel in all_pages:
        src = (ROOT / rel).read_text()
        page = Page()
        page.feed(src)
        titles.setdefault(page.title.strip(), []).append(rel)
        descs.setdefault(page.meta.get("description", ""), []).append(rel)
        if rel not in targets:
            continue

        f = rel
        robots = page.meta.get("robots", "")
        indexable = "noindex" not in robots
        text = " ".join(page.text) + " " + page.title + " " + " ".join(
            page.meta.get(k, "") for k in page.meta
        )

        # Copy rules
        if "—" in text or "&mdash;" in src:
            n = text.count("—") + src.count("&mdash;")
            err(f, f"{n} em dash(es) in copy or metadata")
        ai_hits = re.findall(r"\bAI\b", text) + re.findall(r"\bAI-powered\b", text, re.I)
        if ai_hits and not f.startswith(AI_ALLOWED_PAGES):
            if f.startswith(COMPETITOR_PAGES):
                warn(f, f'{len(ai_hits)} use(s) of "AI": confirm each describes a competitor, never Inkwell')
            else:
                err(f, f'{len(ai_hits)} use(s) of "AI" on a non-competitor page')
        for word in ("wiki", "knowledge graph"):
            if re.search(rf"\b{word}\b", text, re.I):
                warn(f, f'"{word}" appears: use "your story stays connected" framing for the codex')

        # Links
        for href in page.links:
            # Legal pages name the app's domain in prose; that is not a CTA.
            legal_mention = f.startswith(AI_ALLOWED_PAGES) and href == "https://app.inkwell.world"
            if "app.inkwell.world" in href and href != CTA and not legal_mention:
                err(f, f"app link {href} must be {CTA}")
            internal = href.startswith("/") or href.startswith(APEX)
            if not internal:
                continue
            path = href.removeprefix(APEX) or "/"
            if re.search(r"\.html(#|\?|$)", path):
                err(f, f"internal link {href} has .html; use the extensionless URL")
            elif not path.startswith("/assets/") and not resolves(path):
                err(f, f"internal link {href} does not resolve to a page")

        # Head metadata
        if not page.title.strip():
            err(f, "missing <title>")
        desc = page.meta.get("description", "")
        if not desc:
            err(f, "missing meta description")
        elif not 50 <= len(desc) <= 170:
            warn(f, f"meta description is {len(desc)} chars (aim for 120 to 160)")
        expected = url_for(rel)
        if indexable:
            if page.canonical != expected:
                err(f, f"canonical is {page.canonical!r}, expected {expected}")
            for key in ("og:url", "og:title", "og:description", "og:image", "twitter:card", "twitter:title", "twitter:description"):
                if not page.meta.get(key):
                    err(f, f"missing {key}")
            if page.meta.get("og:url") and page.meta.get("og:url") != page.canonical:
                err(f, "og:url does not match canonical")
            if expected not in sitemap:
                err(f, f"{expected} is not in sitemap.xml")
            if expected not in llms and expected.rstrip("/") not in llms:
                warn(f, "page is not listed in llms.txt or llms-full.txt")

        # Analytics
        if "/assets/analytics.js" not in page.scripts:
            err(f, "does not load /assets/analytics.js")
        if "googletagmanager.com/gtag/js" in src or re.search(r"\bAW-\d+", src):
            err(f, "inline gtag snippet or Ads ID; tags belong only in assets/analytics.js")
        if "send_to" in src and "conversion" in src:
            err(f, "looks like a Google Ads conversion event snippet (never add one)")

        # Structured data
        for i, block in enumerate(page.jsonld):
            try:
                data = json.loads(block)
            except json.JSONDecodeError as e:
                err(f, f"JSON-LD block {i + 1} does not parse: {e}")
                continue
            blob = json.dumps(data, ensure_ascii=False)
            if "—" in blob:
                err(f, f"JSON-LD block {i + 1} contains an em dash")
            if data.get("@type") == "FAQPage":
                for q in data.get("mainEntity", []):
                    name = q.get("name", "")
                    if name and name not in " ".join(page.text):
                        warn(f, f'FAQ JSON-LD question not visible on page: "{name[:60]}"')

    for value, files in list(titles.items()) + list(descs.items()):
        hit = [x for x in files if x in targets]
        if value and len(files) > 1 and hit:
            warn(", ".join(files), f'share the same title or description: "{value[:60]}"')

    for url in sorted(sitemap):
        if not resolves(url.removeprefix(APEX) or "/"):
            errors.append(f"ERROR sitemap.xml: {url} has no matching file")

    for line in errors + warns:
        print(line)
    print(f"\n{len(targets)} page(s) checked: {len(errors)} error(s), {len(warns)} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
