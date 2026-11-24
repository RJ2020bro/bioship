// Builds www/ (used by the PWA deploy, Capacitor and Electron) from index.html.
// index.html is never modified: PWA tags are injected into the www/ copy only.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('..', import.meta.url).pathname;
const out = root + 'www/';
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

let html = readFileSync(root + 'index.html', 'utf8');
const h = createHash('sha256').update(html);
for (const f of ['net.js', 'firebase-config.js', 'pwa/sw.js']) if (existsSync(root + f)) h.update(readFileSync(root + f));
const version = h.digest('hex').slice(0, 12);

const head = `
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="BioShip">
<script>
window.BIOSHIP_PLATFORM = (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ? 'mobile'
  : (window.bioshipDesktop ? 'desktop' : 'web');
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.bioshipDesktop) {
  addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
}
</script>
`;
if (!html.includes('</head>')) throw new Error('index.html has no </head>');
html = html.replace('</head>', head + '</head>');
writeFileSync(out + 'index.html', html);

const sw = readFileSync(root + 'pwa/sw.js', 'utf8').replace('__VERSION__', version);
writeFileSync(out + 'sw.js', sw);
cpSync(root + 'pwa/manifest.webmanifest', out + 'manifest.webmanifest');
cpSync(root + 'pwa/icons', out + 'icons', { recursive: true });
for (const f of ['net.js', 'firebase-config.js']) if (existsSync(root + f)) cpSync(root + f, out + f);
if (existsSync(root + '.nojekyll')) cpSync(root + '.nojekyll', out + '.nojekyll');

console.log(`www/ built (cache version ${version})`);
