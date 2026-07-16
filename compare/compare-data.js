/* Shared data source for the Compare portal.
   The hub matrix and every spoke's two-tool table render from this object,
   so values can never drift between pages. */
window.COMPARE_DATA = {
  rows: [
    { key: "cost",         label: "Cost" },
    { key: "cloudSync",    label: "Cloud sync" },
    { key: "novelists",    label: "Built for novelists" },
    { key: "collab",       label: "Comments & collab" },
    { key: "worldbuilding",label: "Worldbuilding tools" },
    { key: "exportFormats",label: "Export formats" },
    { key: "focusMode",    label: "Focus mode" },
    { key: "offline",      label: "Offline access" }
  ],

  tools: [
    {
      key: "inkwell",
      name: "Inkwell",
      pageUrl: null,
      desc: "For writers who want a calm, organized space that follows them across every device, and helps them keep the habit.",
      values: {
        cost:          { symbol: "$",   tone: "good", label: "Free tier" },
        cloudSync:     { symbol: "✓", tone: "good", label: "Automatic" },
        novelists:     { symbol: "✓", tone: "good", label: "Yes" },
        collab:        { symbol: "≈", tone: "warn", label: "Basic" },
        worldbuilding: { symbol: "✓", tone: "good", label: "Deep" },
        exportFormats: { symbol: "✓", tone: "good", label: "EPUB, PDF" },
        focusMode:     { symbol: "✓", tone: "good", label: "Yes" },
        offline:       { symbol: "✓", tone: "good", label: "Yes" }
      }
    },
    {
      key: "scrivener",
      name: "Scrivener",
      pageUrl: "/compare/scrivener",
      desc: "For writers who want a deep local workspace for notes and research, with fine control over compiling the finished manuscript.",
      values: {
        cost:          { symbol: "$",   tone: "good", label: "$60 once" },
        cloudSync:     { symbol: "✗", tone: "bad",  label: "Manual setup" },
        novelists:     { symbol: "✓", tone: "good", label: "Yes" },
        collab:        { symbol: "✗", tone: "bad",  label: "No" },
        worldbuilding: { symbol: "✓", tone: "good", label: "Deep" },
        exportFormats: { symbol: "✓", tone: "good", label: "EPUB, PDF" },
        focusMode:     { symbol: "✓", tone: "good", label: "Yes" },
        offline:       { symbol: "✓", tone: "good", label: "Yes" }
      }
    },
    {
      key: "dabble",
      name: "Dabble",
      pageUrl: "/compare/dabble",
      desc: "For writers who want a subscription tool focused on plotting and drafting, with story-organization features built in.",
      values: {
        cost:          { symbol: "$$$", tone: "bad",  label: "$19–49/mo" },
        cloudSync:     { symbol: "✓", tone: "good", label: "Automatic" },
        novelists:     { symbol: "✓", tone: "good", label: "Yes" },
        collab:        { symbol: "✓", tone: "good", label: "Yes" },
        worldbuilding: { symbol: "✓", tone: "good", label: "Deep" },
        exportFormats: { symbol: "✗", tone: "bad",  label: "Word, Text" },
        focusMode:     { symbol: "✓", tone: "good", label: "Yes" },
        offline:       { symbol: "≈", tone: "warn", label: "Desktop app" }
      }
    },
    {
      key: "reedsy",
      name: "Reedsy",
      pageUrl: "/compare/reedsy",
      desc: "For writers who want a clean, free writing space with professional typesetting.",
      values: {
        cost:          { symbol: "$",   tone: "good", label: "Free core" },
        cloudSync:     { symbol: "✓", tone: "good", label: "Automatic" },
        novelists:     { symbol: "✓", tone: "good", label: "Yes" },
        collab:        { symbol: "✓", tone: "good", label: "Yes" },
        worldbuilding: { symbol: "≈", tone: "warn", label: "Light" },
        exportFormats: { symbol: "✓", tone: "good", label: "EPUB, PDF" },
        focusMode:     { symbol: "✓", tone: "good", label: "Yes" },
        offline:       { symbol: "✗", tone: "bad",  label: "Browser only" }
      }
    },
    {
      key: "word",
      name: "MS Word",
      pageUrl: "/compare/word",
      desc: "For writers who already live in Word and want a familiar page, though it was built for documents rather than novels.",
      values: {
        cost:          { symbol: "$$$", tone: "bad",  label: "~$70/yr" },
        cloudSync:     { symbol: "≈", tone: "warn", label: "If set up" },
        novelists:     { symbol: "✗", tone: "bad",  label: "No" },
        collab:        { symbol: "✓", tone: "good", label: "Yes" },
        worldbuilding: { symbol: "✗", tone: "bad",  label: "None" },
        exportFormats: { symbol: "≈", tone: "warn", label: "No EPUB" },
        focusMode:     { symbol: "✗", tone: "bad",  label: "No" },
        offline:       { symbol: "✓", tone: "good", label: "Yes" }
      }
    },
    {
      key: "google-docs",
      name: "Google Docs",
      pageUrl: "/compare/google-docs",
      desc: "For writers who want simple, free, cloud-based writing and easy sharing, without any novel-specific structure.",
      values: {
        cost:          { symbol: "$",   tone: "good", label: "Free" },
        cloudSync:     { symbol: "✓", tone: "good", label: "Automatic" },
        novelists:     { symbol: "✗", tone: "bad",  label: "No" },
        collab:        { symbol: "✓", tone: "good", label: "Yes" },
        worldbuilding: { symbol: "✗", tone: "bad",  label: "None" },
        exportFormats: { symbol: "≈", tone: "warn", label: "No EPUB" },
        focusMode:     { symbol: "✗", tone: "bad",  label: "No" },
        offline:       { symbol: "≈", tone: "warn", label: "If enabled" }
      }
    },
    {
      key: "ellipsus",
      name: "Ellipsus",
      pageUrl: "/compare/ellipsus",
      desc: "For writers who value collaborative drafting and version history, especially those writing with others.",
      values: {
        cost:          { symbol: "$",   tone: "good", label: "Free core" },
        cloudSync:     { symbol: "✓", tone: "good", label: "Automatic" },
        novelists:     { symbol: "✓", tone: "good", label: "Yes" },
        collab:        { symbol: "✓", tone: "good", label: "Yes" },
        worldbuilding: { symbol: "≈", tone: "warn", label: "Light" },
        exportFormats: { symbol: "≈", tone: "warn", label: "No EPUB" },
        focusMode:     { symbol: "✓", tone: "good", label: "Yes" },
        offline:       { symbol: "✗", tone: "bad",  label: "Browser only" }
      }
    },
    {
      key: "obsidian",
      name: "Obsidian",
      pageUrl: null,
      desc: "For writers who think in linked notes and want to build their own system, with the setup that flexibility asks for.",
      values: {
        cost:          { symbol: "$",   tone: "good", label: "Free core" },
        cloudSync:     { symbol: "≈", tone: "warn", label: "Paid add-on" },
        novelists:     { symbol: "✗", tone: "bad",  label: "No" },
        collab:        { symbol: "✗", tone: "bad",  label: "No" },
        worldbuilding: { symbol: "≈", tone: "warn", label: "DIY" },
        exportFormats: { symbol: "✗", tone: "bad",  label: "Plugins only" },
        focusMode:     { symbol: "≈", tone: "warn", label: "Plugin-based" },
        offline:       { symbol: "✓", tone: "good", label: "Yes" }
      }
    }
  ]
};
