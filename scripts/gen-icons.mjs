// Generates brand placeholder PWA icons (no deps, built-in zlib).
// Background #050508, purple baseline bar, orange ascending staircase.
import zlib from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = t[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
})();

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(CRC(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function png(size) {
  const W = size,
    H = size;
  const px = (r, g, b) => [r, g, b, 255];
  const bg = px(5, 5, 8);
  const purple = px(123, 63, 228);
  const orange = px(255, 107, 43);

  const buf = new Uint8Array(H * (1 + W * 4));
  for (let y = 0; y < H; y++) {
    const row = y * (1 + W * 4);
    buf[row] = 0; // filter: none
    for (let x = 0; x < W; x++) {
      let c = bg;
      // purple baseline bar
      if (y >= H * 0.66 && y <= H * 0.71 && x >= W * 0.18 && x <= W * 0.82) c = purple;
      // orange ascending staircase
      const steps = 4;
      const sw = (W * 0.64) / steps;
      for (let s = 0; s < steps; s++) {
        const x0 = W * 0.18 + s * sw;
        const top = H * 0.62 - s * (H * 0.1);
        if (x >= x0 && x <= x0 + sw * 0.7 && y >= top && y <= H * 0.66) c = orange;
      }
      const o = row + 1 + x * 4;
      buf[o] = c[0];
      buf[o + 1] = c[1];
      buf[o + 2] = c[2];
      buf[o + 3] = c[3];
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const idat = zlib.deflateSync(Buffer.from(buf), { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync(new URL("../public/icons/", import.meta.url), { recursive: true });
for (const s of [192, 512]) {
  writeFileSync(new URL(`../public/icons/icon-${s}.png`, import.meta.url), png(s));
  console.log(`icon-${s}.png written`);
}
