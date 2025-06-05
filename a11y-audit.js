/**
 * Run accessibility audit using axe-core on a local dev server.
 * Usage: node a11y-audit.js http://localhost:3000
 */
const axe = require("axe-core");
const puppeteer = require("puppeteer");

(async () => {
  const url = process.argv[2] || "http://localhost:3000";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });

  // Inject axe-core
  await page.addScriptTag({ path: require.resolve("axe-core") });
  const results = await page.evaluate(async () => {
    return await window.axe.run();
  });

  if (results.violations.length === 0) {
    console.log("No accessibility violations found.");
  } else {
    console.log("Accessibility violations:");
    results.violations.forEach((v) => {
      console.log(`- [${v.impact}] ${v.help}: ${v.nodes.length} nodes`);
      v.nodes.forEach((n) => {
        console.log(`  Selector: ${n.target.join(", ")}`);
        console.log(`  Failure: ${n.failureSummary}`);
      });
    });
  }
  await browser.close();
})();
