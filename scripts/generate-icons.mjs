/**
 * generate-icons.mjs
 * Gera todos os assets de ícone do app a partir de:
 *   public/icon.png       → ícones dentro do app e ic_launcher / ic_launcher_foreground
 *   public/icon_round.png → ic_launcher_round (tela home Android), favicon, PWA manifest
 *
 * Outputs:
 *   public/favicon.ico               (multi-size: 16, 32, 48)
 *   public/icons/icon-{size}.webp    (PWA manifest: 48,72,96,128,192,256,512)
 *   android res mipmap folders: ic_launcher.png, ic_launcher_round.png,
 *                                ic_launcher_foreground.png, ic_launcher_background.png
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const SRC       = resolve(ROOT, 'public', 'icon.png');
const SRC_ROUND = resolve(ROOT, 'public', 'icon_round.png');

const ensure = (dir) => mkdirSync(dir, { recursive: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

async function toPng(src, size) {
  return sharp(src).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

async function toWebp(src, size) {
  return sharp(src).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ lossless: true }).toBuffer();
}

// Minimal ICO writer: supports multiple PNG-encoded images packed into one .ico
function buildIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const HEADER = 6; // ICO header
  const DIR_ENTRY = 16; // per image
  const headerSize = HEADER + DIR_ENTRY * count;

  // Calculate offsets
  let offset = headerSize;
  const entries = pngBuffers.map((buf, i) => {
    const entry = { buf, size: sizes[i], offset };
    offset += buf.length;
    return entry;
  });

  const totalSize = offset;
  const out = Buffer.alloc(totalSize);

  // ICO header
  out.writeUInt16LE(0, 0);     // reserved
  out.writeUInt16LE(1, 2);     // type: 1 = ICO
  out.writeUInt16LE(count, 4); // count

  // Directory entries
  entries.forEach(({ buf, size, offset }, i) => {
    const base = HEADER + i * DIR_ENTRY;
    out.writeUInt8(size >= 256 ? 0 : size, base);      // width (0 = 256)
    out.writeUInt8(size >= 256 ? 0 : size, base + 1);  // height
    out.writeUInt8(0, base + 2);   // color count
    out.writeUInt8(0, base + 3);   // reserved
    out.writeUInt16LE(1, base + 4); // planes
    out.writeUInt16LE(32, base + 6); // bit count
    out.writeUInt32LE(buf.length, base + 8);  // size of image data
    out.writeUInt32LE(offset, base + 12);     // offset of image data
    buf.copy(out, offset);
  });

  return out;
}

// ── 1. public/favicon.ico (icon_round — fora do app) ─────────────────────────
const icoSizes = [16, 32, 48];
const icoBufs  = await Promise.all(icoSizes.map((s) => toPng(SRC_ROUND, s)));
writeFileSync(resolve(ROOT, 'public', 'favicon.ico'), buildIco(icoBufs, icoSizes));

// ── 2. public/icons/*.webp (PWA manifest — icon_round) ───────────────────────
const webpSizes = [48, 72, 96, 128, 192, 256, 512];
const iconsDir  = resolve(ROOT, 'public', 'icons');
ensure(iconsDir);
for (const size of webpSizes) {
  writeFileSync(resolve(iconsDir, `icon-${size}.webp`), await toWebp(SRC_ROUND, size));
}

// ── 3. Android mipmap-* ───────────────────────────────────────────────────────
// Android adaptive icon sizes (dp → px at each density)
const ANDROID_DENSITIES = [
  { name: 'mipmap-ldpi',    ic: 36,  fg: 54  },
  { name: 'mipmap-mdpi',    ic: 48,  fg: 72  },
  { name: 'mipmap-hdpi',    ic: 72,  fg: 108 },
  { name: 'mipmap-xhdpi',   ic: 96,  fg: 144 },
  { name: 'mipmap-xxhdpi',  ic: 144, fg: 216 },
  { name: 'mipmap-xxxhdpi', ic: 192, fg: 288 },
];

const ANDROID_RES = resolve(ROOT, 'android', 'app', 'src', 'main', 'res');

// Transparent 1x1 PNG for background (adaptive icon background = transparent)
const transparentBg = await sharp({
  create: { width: 1, height: 1, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
}).png().toBuffer();

for (const { name, ic, fg } of ANDROID_DENSITIES) {
  const dir = resolve(ANDROID_RES, name);
  ensure(dir);
  // ic_launcher + foreground: icon.png (forma dentro do app — sem recorte circular)
  writeFileSync(resolve(dir, 'ic_launcher.png'),            await toPng(SRC, ic));
  writeFileSync(resolve(dir, 'ic_launcher_foreground.png'), await toPng(SRC, fg));
  // ic_launcher_round: icon_round.png (tela home Android)
  writeFileSync(resolve(dir, 'ic_launcher_round.png'),      await toPng(SRC_ROUND, ic));
  // Background: expand transparent 1x1 to the foreground size
  writeFileSync(
    resolve(dir, 'ic_launcher_background.png'),
    await sharp(transparentBg).resize(fg, fg, { fit: 'fill' }).png().toBuffer()
  );
}
