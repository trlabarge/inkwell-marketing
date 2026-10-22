#!/usr/bin/env node
// Screenshot pages at desktop and phone widths and flag layout problems.
// Not part of the site and never deployed. Uses the globally installed
// Playwright, so nothing is added to the repo:
//
//   NODE_PATH="$(npm root -g)" node scripts/preview.js learn/x.html [more.html] [--out dir]
//
// Starts its own static server on port 8123, writes <page>-1280.png and
// <page>-390.png to --out (default: ./.preview, which is gitignored), and
// exits 1 on horizontal overflow, console errors, or broken anchor links.

const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const outDir = outIdx >= 0 ? args.splice(outIdx, 2)[1] : ".preview";
const pages = args.length ? args : ["index.html"];
const root = path.resolve(__dirname, "..");
const PORT = 8123;

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const server = spawn("python3", ["-m", "http.server", String(PORT), "-d", root], { stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 800));

  const browser = await chromium.launch();
  let failed = false;

  for (const page of pages) {
    for (const width of [1280, 390]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      const tab = await ctx.newPage();
      const errors = [];
      tab.on("pageerror", (e) => errors.push(e.message));
      tab.on("console", (m) => m.type() === "error" && errors.push(m.text()));

      await tab.goto(`http://localhost:${PORT}/${page}`, { waitUntil: "networkidle" });
      const report = await tab.evaluate(() => {
        const overflow = document.documentElement.scrollWidth - window.innerWidth;
        const missing = [...document.querySelectorAll('a[href^="#"]')]
          .map((a) => a.getAttribute("href").slice(1))
          .filter((id) => id && !document.getElementById(id));
        return { overflow, missing };
      });

      const shot = path.join(outDir, `${page.replace(/\//g, "_").replace(/\.html$/, "")}-${width}.png`);
      await tab.screenshot({ path: shot, fullPage: true });

      // Third-party hosts are unreachable offline; only local errors count.
      const local = errors.filter((e) => !/googletagmanager|google-analytics|fonts\.g/.test(e));
      const problems = [];
      if (report.overflow > 1) problems.push(`horizontal overflow ${report.overflow}px`);
      if (report.missing.length) problems.push(`anchors with no target: ${report.missing.join(", ")}`);
      if (local.length) problems.push(`console errors: ${local.join(" | ")}`);
      console.log(`${problems.length ? "FAIL" : "ok  "} ${page} @${width}px  ${shot}${problems.length ? "\n     " + problems.join("\n     ") : ""}`);
      failed = failed || problems.length > 0;
      await ctx.close();
    }
  }

  await browser.close();
  server.kill();
  process.exit(failed ? 1 : 0);
})();
