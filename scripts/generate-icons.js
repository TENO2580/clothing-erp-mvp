import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Pure Node.js PNG generator with no external dependencies
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    for (let j = 0; j < 8; j++) {
      const bit = (crc ^ byte) & 1;
      crc = (crc >>> 1) ^ (bit ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function generateVastraIconPNG(size, isMaskable = false) {
  const width = size;
  const height = size;
  const bytesPerPixel = 4;
  const scanlineWidth = width * bytesPerPixel + 1; // +1 filter byte
  const rawData = Buffer.alloc(scanlineWidth * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = size * (isMaskable ? 0.48 : 0.42);

  // Colors
  const bgNavy = [30, 34, 51, 255];       // #1E2233
  const goldAccent = [217, 119, 6, 255];   // #D97706
  const goldLight = [245, 158, 11, 255];   // #F59E0B
  const cream = [251, 251, 250, 255];      // #FBFBFA
  const amberDark = [139, 94, 52, 255];    // #8B5E34

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineWidth;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background
      let r = bgNavy[0];
      let g = bgNavy[1];
      let b = bgNavy[2];
      let a = 255;

      if (!isMaskable) {
        // Rounded squircle background
        const cornerR = size * 0.22;
        const inBoxX = Math.abs(dx) <= (cx - cornerR);
        const inBoxY = Math.abs(dy) <= (cy - cornerR);
        let inSquircle = false;

        if (inBoxX || inBoxY) {
          inSquircle = (Math.abs(dx) <= cx && Math.abs(dy) <= cy);
        } else {
          const cornerDist = Math.sqrt(
            Math.pow(Math.abs(dx) - (cx - cornerR), 2) +
            Math.pow(Math.abs(dy) - (cy - cornerR), 2)
          );
          inSquircle = cornerDist <= cornerR;
        }

        if (!inSquircle) {
          r = 0; g = 0; b = 0; a = 0;
          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = a;
          continue;
        }
      }

      // Draw elegant decorative gold ring
      const ringOuter = size * 0.38;
      const ringInner = size * 0.36;
      if (dist >= ringInner && dist <= ringOuter) {
        const ringGrad = (y / height);
        r = Math.round(goldLight[0] * (1 - ringGrad) + goldAccent[0] * ringGrad);
        g = Math.round(goldLight[1] * (1 - ringGrad) + goldAccent[1] * ringGrad);
        b = Math.round(goldLight[2] * (1 - ringGrad) + goldAccent[2] * ringGrad);
      }

      // Draw Vastra "V" + Shirt / Hanger Monogram in center
      // 1. Shirt collar & hanger lines
      const ny = (y - cy) / (size * 0.35); // Normalized -1 to 1 in icon zone
      const nx = (x - cx) / (size * 0.35);

      // Shirt body & V-neck monogram
      const inVLeft = (nx >= -0.7 && nx <= -0.1 && Math.abs(ny - (nx * 1.8 + 0.4)) < 0.16 && ny >= -0.4 && ny <= 0.6);
      const inVRight = (nx >= 0.1 && nx <= 0.7 && Math.abs(ny - (-nx * 1.8 + 0.4)) < 0.16 && ny >= -0.4 && ny <= 0.6);
      const inVBottom = (Math.abs(nx) <= 0.22 && ny >= 0.45 && ny <= 0.65);

      // Collar triangle
      const inCollarL = (nx >= -0.45 && nx <= -0.05 && ny >= -0.65 && ny <= -0.2 && Math.abs(ny - (nx * 1.2 - 0.1)) < 0.12);
      const inCollarR = (nx >= 0.05 && nx <= 0.45 && ny >= -0.65 && ny <= -0.2 && Math.abs(ny - (-nx * 1.2 - 0.1)) < 0.12);

      // Central button / diamond
      const inDiamond = (Math.abs(nx) + Math.abs(ny + 0.05) < 0.1);

      if (inVLeft || inVRight || inVBottom || inCollarL || inCollarR || inDiamond) {
        // Gold gradient
        const t = (nx + 1) / 2;
        r = Math.round(goldLight[0] * (1 - t) + cream[0] * t * 0.5 + goldAccent[0] * (1 - t));
        g = Math.round(goldLight[1] * (1 - t) + cream[1] * t * 0.5 + goldAccent[1] * (1 - t));
        b = Math.round(goldLight[2] * (1 - t) + cream[2] * t * 0.5 + goldAccent[2] * (1 - t));
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Build PNG Buffer
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate all icons
const outDir = path.resolve(process.cwd(), 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating PWA Icons...');

fs.writeFileSync(path.join(outDir, 'icon-192.png'), generateVastraIconPNG(192, false));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), generateVastraIconPNG(512, false));
fs.writeFileSync(path.join(outDir, 'icon-maskable-192.png'), generateVastraIconPNG(192, true));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512.png'), generateVastraIconPNG(512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), generateVastraIconPNG(180, false));

// Also write favicon SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="128" fill="#1E2233"/>
  <circle cx="256" cy="256" r="190" stroke="#D97706" stroke-width="12" stroke-dasharray="16 8"/>
  <path d="M160 170 L256 120 L352 170 L300 230 L256 195 L212 230 Z" fill="#F59E0B"/>
  <path d="M160 210 L256 390 L352 210 L305 210 L256 310 L207 210 Z" fill="url(#goldGrad)"/>
  <circle cx="256" cy="245" r="12" fill="#FBFBFA"/>
  <defs>
    <linearGradient id="goldGrad" x1="160" y1="210" x2="352" y2="390" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F59E0B"/>
      <stop offset="0.5" stop-color="#FBFBFA"/>
      <stop offset="1" stop-color="#D97706"/>
    </linearGradient>
  </defs>
</svg>`;

fs.writeFileSync(path.join(outDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.resolve(process.cwd(), 'public', 'favicon.svg'), svgContent);

console.log('PWA icons successfully generated in public/icons/ and public/favicon.svg');
