import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';
import { chromium } from '@playwright/test';

const require = createRequire(import.meta.url);
const lighthouse = require('lighthouse').default;
const config = JSON.parse(await readFile(new URL('../lighthouse.config.json', import.meta.url), 'utf8'));
const out = path.resolve('lighthouse-reports');
await mkdir(out, { recursive: true });
const chrome = process.env.CHROME_PATH ?? chromium.executablePath();
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const build = spawn(npm, ['run', 'build:demo'], { stdio: 'inherit', shell: process.platform === 'win32' });
const buildExitCode = await new Promise((resolve) => build.on('exit', resolve));
if (buildExitCode !== 0) process.exit(Number(buildExitCode) || 1);
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173'], { stdio: 'ignore' });
const probe = createServer();
await new Promise((resolve) => probe.listen(0, '127.0.0.1', resolve));
const debuggingPort = probe.address().port;
await new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()));
const userDataDir = await mkdtemp(path.join(tmpdir(), 'kurio-lighthouse-'));
const chromeProcess = spawn(chrome, [`--remote-debugging-port=${debuggingPort}`, `--user-data-dir=${userDataDir}`, '--headless=new', '--no-sandbox', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });

try {
  const deadline = Date.now() + 30_000;
  let ready = false;
  while (Date.now() < deadline && !ready) {
    try { await fetch('http://127.0.0.1:4173'); ready = true; } catch { await new Promise((resolve) => setTimeout(resolve, 250)); }
  }
  if (!ready) throw new Error('Vite preview did not start in time.');
  const chromeDeadline = Date.now() + 30_000;
  let chromeReady = false;
  while (Date.now() < chromeDeadline && !chromeReady) {
    try { await fetch(`http://127.0.0.1:${debuggingPort}/json/version`); chromeReady = true; } catch { await new Promise((resolve) => setTimeout(resolve, 250)); }
  }
  if (!chromeReady) throw new Error('Headless Chrome did not start in time.');
  const summaries = [];
  for (const page of config.pages) for (const profile of config.profiles) {
    const runs = [];
    for (let run = 1; run <= config.runsPerPageProfile; run++) {
      const result = await lighthouse(`http://127.0.0.1:4173${page.path}`, { port: debuggingPort, output: ['html', 'json'], onlyCategories: config.categories, formFactor: profile.formFactor, screenEmulation: profile.screenEmulation });
      const lhr = result.lhr;
      const scores = Object.fromEntries(config.categories.map((category) => [category, Math.round((lhr.categories[category]?.score ?? 0) * 100)]));
      const reportName = `${page.name}-${profile.name}-run-${run}`;
      await writeFile(path.join(out, `${reportName}.html`), result.report[0]);
      await writeFile(path.join(out, `${reportName}.json`), result.report[1]);
      runs.push({ scores, LCP: lhr.audits['largest-contentful-paint']?.numericValue, CLS: lhr.audits['cumulative-layout-shift']?.numericValue, TBT: lhr.audits['total-blocking-time']?.numericValue, userAgent: lhr.userAgent });
    }
    const median = (values) => [...values].sort((a, b) => a - b)[1];
    summaries.push({
      page: page.name,
      profile: profile.name,
      median: Object.fromEntries(config.categories.map((category) => [category, median(runs.map((run) => run.scores[category]))])),
      metricsMedian: Object.fromEntries(['LCP', 'CLS', 'TBT'].map((metric) => [metric, median(runs.map((run) => run[metric]))])),
      runs,
    });
  }
  const chromeVersion = summaries[0]?.runs[0]?.userAgent ?? 'Disponível nos relatórios JSON individuais';
  await writeFile(path.join(out, 'summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), lighthouseVersion: require('lighthouse/package.json').version, chromeVersion, nodeVersion: process.version, platform: process.platform, chrome, summaries }, null, 2));
  console.log(`Reports written to ${out}`);
} finally {
  chromeProcess.kill();
  server.kill();
  await Promise.race([
    new Promise((resolve) => chromeProcess.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
  await rm(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
}
