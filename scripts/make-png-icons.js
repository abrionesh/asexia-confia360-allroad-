import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function createPng(width, height, colorFn) {
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = colorFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Logo color generator matching uploaded emblem:
// Sapphire Blue + Emerald Leaf with Circular Ring
function getAsexiaPixel(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;
  const cx = (nx - 0.5) * 2;
  const cy = (ny - 0.5) * 2;
  const dist = Math.sqrt(cx * cx + cy * cy);

  // Outside circle -> transparent or deep background
  if (dist > 0.98) {
    return [0, 0, 0, 0];
  }

  // Outer Ring: Blue to Green gradient (dist between 0.88 and 0.98)
  if (dist >= 0.88) {
    const angle = Math.atan2(cy, cx); // -PI to PI
    const t = (angle + Math.PI) / (2 * Math.PI); // 0 to 1
    // Blue (#0047AB) to Emerald (#10B981) to Lime (#84CC16)
    const r = Math.round(2 + t * 130);
    const g = Math.round(71 + t * 133);
    const b = Math.round(171 * (1 - t) + 22 * t);
    return [r, g, b, 255];
  }

  // Ring inner shadow
  if (dist >= 0.85) {
    return [220, 230, 242, 255];
  }

  // Inner White Circular Badge Base
  let r = 250;
  let g = 252;
  let b = 255;

  // Center 'A' ribbon coordinates
  // Left arch & apex
  const apexX = 0.50;
  const apexY = 0.22;
  const baseY = 0.74;
  const leftX = 0.18;
  const rightX = 0.82;

  // Main Blue Ribbon
  if (ny >= apexY && ny <= baseY) {
    const progress = (ny - apexY) / (baseY - apexY);
    const minX = apexX - progress * (apexX - leftX);
    const maxX = minX + 0.19;

    if (nx >= minX && nx <= maxX) {
      // Sapphire Blue gradient
      return [2, 132, 199, 255];
    }
  }

  // Right lower leg of A (ny between 0.60 and 0.74, nx between 0.62 and 0.84)
  if (ny >= 0.60 && ny <= 0.74 && nx >= 0.62 && nx <= 0.84) {
    return [3, 105, 161, 255];
  }

  // Green Leaf Crossbar (ny between 0.46 and 0.58, nx between 0.38 and 0.82)
  if (ny >= 0.46 && ny <= 0.58 && nx >= 0.38 && nx <= 0.82) {
    const leafProgress = (nx - 0.38) / (0.82 - 0.38);
    // Green gradient (#22C55E to #84CC16)
    const gr = Math.round(34 + leafProgress * 98);
    const gg = Math.round(197 + leafProgress * 7);
    const gb = Math.round(94 * (1 - leafProgress) + 22 * leafProgress);
    return [gr, gg, gb, 255];
  }

  return [r, g, b, 255];
}

const publicDir = path.resolve('public');
console.log('Generating updated brand icons...');
const png192 = createPng(192, 192, getAsexiaPixel);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

const png512 = createPng(512, 512, getAsexiaPixel);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), png512);

const png180 = createPng(180, 180, getAsexiaPixel);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);

console.log('Successfully generated updated brand icons in /public.');
