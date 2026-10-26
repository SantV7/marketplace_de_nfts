import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const config = JSON.parse(await readFile(new URL('../lighthouse.config.json', import.meta.url), 'utf8'));
const output = path.resolve('lighthouse-reports');
const median = (values) => [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)];
const summaries = [];

for (const page of config.pages) {
  for (const profile of config.profiles) {
    const runs = [];
    for (let run = 1; run <= config.runsPerPageProfile; run += 1) {
      const report = JSON.parse(await readFile(path.join(output, `${page.name}-${profile.name}-run-${run}.json`), 'utf8'));
      runs.push({
        scores: Object.fromEntries(config.categories.map((category) => [category, Math.round((report.categories[category]?.score ?? 0) * 100)])),
        LCP: report.audits['largest-contentful-paint']?.numericValue,
        CLS: report.audits['cumulative-layout-shift']?.numericValue,
        TBT: report.audits['total-blocking-time']?.numericValue,
        userAgent: report.userAgent,
      });
    }
    summaries.push({
      page: page.name,
      profile: profile.name,
      median: Object.fromEntries(config.categories.map((category) => [category, median(runs.map((run) => run.scores[category]))])),
      metricsMedian: Object.fromEntries(['LCP', 'CLS', 'TBT'].map((metric) => [metric, median(runs.map((run) => run[metric]))])),
      runs,
    });
  }
}

const firstReport = JSON.parse(await readFile(path.join(output, `${config.pages[0].name}-${config.profiles[0].name}-run-1.json`), 'utf8'));
await writeFile(path.join(output, 'summary.json'), JSON.stringify({
  generatedAt: new Date().toISOString(),
  lighthouseVersion: firstReport.lighthouseVersion,
  chromeVersion: firstReport.userAgent,
  nodeVersion: process.version,
  platform: process.platform,
  summaries,
}, null, 2));

console.log(`Lighthouse summary written to ${path.join(output, 'summary.json')}`);
