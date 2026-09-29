// Gate (run against a running build): no sideways scroll at 390px, no text under 12px, in both themes and both audiences.
// Usage: BASE=http://localhost:3000 node scripts/check-layout.mjs [--shots dir]
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const base = process.env.BASE ?? "http://localhost:3000";
const shotsDir = process.argv.includes("--shots") ? process.argv[process.argv.indexOf("--shots") + 1] : null;
const exe = process.env.CHROMIUM_PATH ?? (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch({ executablePath: exe });
const problems = [];
if (shotsDir) fs.mkdirSync(shotsDir, { recursive: true });

for (const route of ["/", "/investor", "/about", "/still", "/about/still"]) {
for (const width of [390, 768, 1280]) {
  for (const theme of ["day", "night"]) {
    for (const aud of ["companies", "solo"]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(`${base}${route}?theme=${theme}&for=${aud}`, { waitUntil: "networkidle" });
      const r = await page.evaluate(() => {
        const small = [];
        for (const el of document.querySelectorAll("body *")) {
          if (!el.childNodes.length || getComputedStyle(el).display === "none") continue;
          const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (!own) continue;
          const fs = parseFloat(getComputedStyle(el).fontSize);
          if (fs < 12) small.push(`${el.tagName}.${el.className} ${fs}px "${el.textContent.trim().slice(0, 30)}"`);
        }
        return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, small, bg: getComputedStyle(document.body).backgroundColor, theme: document.documentElement.dataset.theme };
      });
      const tag = `${route} ${width}/${theme}/${aud}`;
      if (r.sw > r.iw) problems.push(`${tag}: sideways scroll (${r.sw} > ${r.iw})`);
      if (r.small.length) problems.push(`${tag}: text under 12px: ${r.small.slice(0, 4).join("; ")}`);
      if (r.theme !== theme) problems.push(`${tag}: theme is ${r.theme}`);
      if (shotsDir && (aud === "companies" || width === 390)) await page.screenshot({ path: path.join(shotsDir, `${route === "/" ? "home" : route.slice(1).replace("/", "-")}-${width}-${theme}-${aud}.png`), fullPage: true });
      await ctx.close();
    }
  }
}
}
// Film pages with motion on: every scene fits its pinned frame at the start, middle and end of its scroll.
for (const route of ["/", "/about"]) {
  for (const [width, height] of [[390, 667], [390, 844], [1280, 800]]) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    const scenes = await page.evaluate(() =>
      [...document.querySelectorAll(".fscene")].filter((e) => e.offsetParent !== null).map((e, i) => ({ i, top: e.getBoundingClientRect().top + scrollY, h: e.offsetHeight })),
    );
    for (const sc of scenes) {
      for (const f of [0, 0.5, 1]) {
        await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, sc.top + (sc.h - height) * f));
        await page.waitForTimeout(450);
        const r = await page.evaluate((i) => {
          const el = [...document.querySelectorAll(".fscene")].filter((e) => e.offsetParent !== null)[i];
          const pin = el.querySelector(".pin");
          return { overflow: pin.scrollHeight - pin.clientHeight, sideways: document.documentElement.scrollWidth - innerWidth };
        }, sc.i);
        const tag = `film ${route} ${width}x${height} scene ${sc.i} p=${f}`;
        if (r.overflow > 0) problems.push(`${tag}: content taller than the pinned frame by ${r.overflow}px`);
        if (r.sideways > 0) problems.push(`${tag}: sideways scroll`);
      }
    }
    await ctx.close();
  }
}

await browser.close();
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("layout ok: /, /investor, /about and the still versions at 390/768/1280 x day/night x companies/solo; film scenes fit their frames at 390x667, 390x844 and 1280x800");
