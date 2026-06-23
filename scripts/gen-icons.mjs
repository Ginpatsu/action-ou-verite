// Rasterizes assets/logo.svg into the app icon PNGs.
// Run: node scripts/gen-icons.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assets = path.resolve(__dirname, '..', 'assets');
const svg = fs.readFileSync(path.join(assets, 'logo.svg'), 'utf8');
// Full-bleed (square corners) variant for the launcher icon / adaptive foreground.
const square = svg.replace('rx="112"', 'rx="0"');

async function render(svgStr, size, out) {
  await sharp(Buffer.from(svgStr), { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(assets, out));
  console.log('  wrote', out, `${size}x${size}`);
}

await render(square, 1024, 'icon.png');
await render(square, 1024, 'android-icon-foreground.png');
await render(svg, 1024, 'splash-icon.png');
await render(svg, 64, 'favicon.png');
console.log('icons generated.');
