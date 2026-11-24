// Renders pwa/icons/icon.svg into the PNGs the PWA, Capacitor and Electron need.
// Needs Playwright with Chromium (npx playwright install chromium).
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const svg = readFileSync(root + 'pwa/icons/icon.svg', 'utf8');
const BG = '#071319';
mkdirSync(root + 'resources', { recursive: true });

const jobs = [
  // [path, size, scale of the art inside the square]
  ['pwa/icons/icon-192.png', 192, 1],
  ['pwa/icons/icon-512.png', 512, 1],
  ['pwa/icons/icon-180.png', 180, 1],
  ['pwa/icons/maskable-512.png', 512, 0.8],
  ['resources/icon.png', 1024, 1],          // Electron + @capacitor/assets app icon
  ['resources/icon-only.png', 1024, 1],
  ['resources/splash.png', 2732, 0.28],     // @capacitor/assets splash (centered logo)
  ['resources/splash-dark.png', 2732, 0.28],
];

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const [file, size, scale] of jobs) {
  await page.setViewportSize({ width: size, height: size });
  const art = Math.round(size * scale);
  await page.setContent(`<html><body style="margin:0;background:${BG};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${art}px;height:${art}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`);
  await page.screenshot({ path: root + file, omitBackground: false });
  console.log('wrote', file);
}
await browser.close();
