import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
let lighthouse;
try { lighthouse = require('lighthouse'); } catch { console.error('Instale lighthouse como dependência de desenvolvimento antes de executar a auditoria.'); process.exit(1); }
const config = JSON.parse(await (await import('node:fs/promises')).readFile(new URL('../lighthouse.config.json', import.meta.url), 'utf8'));
const out = path.resolve('lighthouse-reports');
await mkdir(out, { recursive: true });
const chrome = process.env.CHROME_PATH ?? (process.platform === 'win32' ? 'chrome' : 'google-chrome');
const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], { stdio: 'ignore', shell: process.platform === 'win32' });
try {
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const summaries = [];
  for (const page of config.pages) for (const profile of config.profiles) {
    const runs = [];
    for (let run = 1; run <= config.runsPerPageProfile; run++) {
      const result = await lighthouse(`http://127.0.0.1:4173${page.path}`, { port: 9222, output: ['html', 'json'], onlyCategories: config.categories, formFactor: profile.formFactor, screenEmulation: profile.screenEmulation });
      const lhr = result.lhr;
      const scores = Object.fromEntries(config.categories.map((category) => [category, Math.round((lhr.categories[category]?.score ?? 0) * 100)]));
      const reportName = `${page.name}-${profile.name}-run-${run}`;
      await writeFile(path.join(out, `${reportName}.html`), result.report[0]);
      await writeFile(path.join(out, `${reportName}.json`), result.report[1]);
      runs.push({ scores, LCP: lhr.audits['largest-contentful-paint']?.numericValue, CLS: lhr.audits['cumulative-layout-shift']?.numericValue, TBT: lhr.audits['total-blocking-time']?.numericValue });
    }
    const median = (key) => runs.map((run) => run.scores[key]).sort((a, b) => a - b)[1];
    summaries.push({ page: page.name, profile: profile.name, median: Object.fromEntries(config.categories.map((category) => [category, median(category)])), runs });
  }
  await writeFile(path.join(out, 'summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), lighthouseVersion: require('lighthouse/package.json').version, chrome, summaries }, null, 2));
  console.log(`Relatórios gravados em ${out}`);
} finally { server.kill(); }
