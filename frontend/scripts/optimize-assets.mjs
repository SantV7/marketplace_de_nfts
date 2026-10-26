import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  for (const name of ['brown_nft', 'cosmic_bloom', 'esmeral_ape', 'golden_beat']) {
    const source = new URL(`../src/assets/img/nfts/${name}.png`, import.meta.url);
    const input = await readFile(source);
    const result = await page.evaluate(async (base64) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      const ratio = Math.min(1, 900 / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.round(image.naturalWidth * ratio);
      canvas.height = Math.round(image.naturalHeight * ratio);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/webp', 0.85).split(',')[1];
    }, input.toString('base64'));
    const output = Buffer.from(result, 'base64');
    await writeFile(new URL(`../src/assets/img/nfts/${name}.webp`, import.meta.url), output);
    console.log(`${name}: ${input.length} → ${output.length} bytes`);
  }
} finally { await browser.close(); }
