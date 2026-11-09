// generate-ico.js - Wrap 256x256 PNG into Windows .ico
const fs = require('fs');
const path = require('path');

const iconPngPath = path.join(__dirname, 'assets', 'icons', 'icon.png');
const pngData = fs.readFileSync(iconPngPath);

// Windows ICO Header (6 bytes)
// 0-1: Reserved (0)
// 2-3: Image Type (1 for icon)
// 4-5: Number of Images (1)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);

// Directory Entry (16 bytes)
// 0: Width (0 for 256)
// 1: Height (0 for 256)
// 2: Color Palette (0)
// 3: Reserved (0)
// 4-5: Color Planes (1)
// 6-7: Bits per pixel (32)
// 8-11: Image Data Size in bytes
// 12-15: Image Data Offset from beginning of file (6 + 16 = 22)
const entry = Buffer.alloc(16);
entry.writeUInt8(0, 0); // 256 px
entry.writeUInt8(0, 1); // 256 px
entry.writeUInt8(0, 2);
entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(pngData.length, 8);
entry.writeUInt32LE(22, 12); // offset

const icoBuffer = Buffer.concat([header, entry, pngData]);
fs.writeFileSync(path.join(__dirname, 'assets', 'icons', 'icon.ico'), icoBuffer);
console.log('Successfully generated assets/icons/icon.ico');
