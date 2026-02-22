import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'temporary screenshots');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Args: <url> [label]
const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

// Auto-increment filename so nothing is overwritten
function nextFilename() {
  const existing = fs.readdirSync(outDir).filter(f => f.endsWith('.png'));
  const nums = existing.map(f => {
    const m = f.match(/^screenshot-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  });
  const n = nums.length ? Math.max(...nums) + 1 : 1;
  const suffix = label ? `-${label.replace(/\s+/g, '-')}` : '';
  return `screenshot-${n}${suffix}.png`;
}

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

// Wait for fonts / animations to settle
await new Promise(r => setTimeout(r, 800));

const filename = nextFilename();
const filepath = path.join(outDir, filename);

await page.screenshot({ path: filepath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: temporary screenshots/${filename}`);
