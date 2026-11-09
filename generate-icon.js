// generate-icon.js - Pure Node.js 256x256 PNG Generator for Christmas App Icon
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createIconPNG(width, height) {
  // RGBA buffer (width * height * 4)
  const buffer = Buffer.alloc(width * height * 4);

  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Distance from center
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded app icon shape (Squircle / rounded rectangle)
      const cornerR = 48;
      const halfW = 108;
      const qx = Math.max(0, Math.abs(dx) - (halfW - cornerR));
      const qy = Math.max(0, Math.abs(dy) - (halfW - cornerR));
      const qDist = Math.sqrt(qx * qx + qy * qy);

      if (qDist > cornerR) {
        // Outside rounded icon
        buffer[idx + 0] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0; // Transparent
        continue;
      }

      // Inside Icon Background: Deep Christmas Midnight Blue Radial Gradient
      const grad = Math.min(1.0, dist / 120);
      let r = Math.round(15 + grad * 10);
      let g = Math.round(30 + grad * 15);
      let b = Math.round(60 + grad * 35);
      let a = 255;

      // Draw Gold Outer Border
      if (qDist > cornerR - 3 || (Math.abs(dx) > halfW - 3 && qy <= cornerR) || (Math.abs(dy) > halfW - 3 && qx <= cornerR)) {
        r = 255;
        g = 215;
        b = 0;
      }

      // Draw Christmas Tree Shape
      // Tree apex at (128, 65), base at (128, 195)
      const treeY = y - 70;
      if (treeY >= 0 && treeY <= 125) {
        // 3 tiers of pine
        let tierY = treeY;
        let tierW = 0;
        if (treeY < 45) {
          tierW = (treeY / 45) * 38;
        } else if (treeY < 85) {
          tierW = ((treeY - 30) / 55) * 62;
        } else {
          tierW = ((treeY - 65) / 60) * 85;
        }

        if (Math.abs(dx) <= tierW) {
          // Pine tree needle green gradient
          const depth = (treeY / 125);
          r = Math.round(18 + depth * 10);
          g = Math.round(95 + depth * 35);
          b = Math.round(35 + depth * 15);

          // Snow on tier edge
          if (Math.abs(dx) > tierW - 3.5 || (treeY >= 40 && treeY <= 45) || (treeY >= 80 && treeY <= 85)) {
            r = 240;
            g = 250;
            b = 255;
          }
        }
      }

      // Tree Trunk
      if (y >= 195 && y <= 215 && Math.abs(dx) <= 14) {
        r = 100;
        g = 60;
        b = 30;
      }

      // Golden Star at Top (y: 50 to 70, x: 118 to 138)
      const starDx = x - 128;
      const starDy = y - 62;
      const starDist = Math.sqrt(starDx * starDx + starDy * starDy);
      if (starDist < 14) {
        r = 255;
        g = 225;
        b = 50;
        // Bright star core
        if (starDist < 6) {
          r = 255;
          g = 255;
          b = 220;
        }
      }

      // Colorful Ornaments
      const baubles = [
        { x: 128, y: 110, cr: 230, cg: 40, cb: 40 }, // Red
        { x: 110, y: 140, cr: 255, cg: 215, cb: 0 }, // Gold
        { x: 146, y: 145, cr: 40, cg: 150, cb: 255 }, // Cyan
        { x: 100, y: 175, cr: 230, cg: 50, cb: 50 },  // Red
        { x: 130, y: 165, cr: 255, cg: 220, cb: 20 }, // Gold
        { x: 156, y: 178, cr: 220, cg: 220, cb: 255 } // Silver
      ];

      for (const bauble of baubles) {
        const bDist = Math.hypot(x - bauble.x, y - bauble.y);
        if (bDist <= 6.5) {
          r = bauble.cr;
          g = bauble.cg;
          b = bauble.cb;
          if (bDist <= 2.2) {
            r = Math.min(255, r + 60);
            g = Math.min(255, g + 60);
            b = Math.min(255, b + 60);
          }
          break;
        }
      }

      // Snowflakes in background
      if ((x * 17 + y * 29) % 311 === 0 && Math.abs(dx) > 30) {
        r = 255;
        g = 255;
        b = 255;
      }

      buffer[idx + 0] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG Encoding
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // Filter: None
    buffer.copy(rawData, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = createChunk('IDAT', deflated);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  // CRC32 over type + data
  const crcTarget = Buffer.alloc(4 + len);
  chunk.copy(crcTarget, 0, 4, 8 + len);
  const crc = crc32(crcTarget);
  chunk.writeUInt32BE(crc, 8 + len);

  return chunk;
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
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

// Ensure dir and save
const iconDir = path.join(__dirname, 'assets', 'icons');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

const pngBuf = createIconPNG(256, 256);
fs.writeFileSync(path.join(iconDir, 'icon.png'), pngBuf);
console.log('Successfully generated assets/icons/icon.png (256x256)');
