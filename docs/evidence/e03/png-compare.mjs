// E03 对照工具：解码 PNG 并逐像素比较（验证用，仅依赖 Node 内建 zlib）
import fs from 'node:fs';
import zlib from 'node:zlib';

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/** 读取 PNG 为 { width, height, channels, data }（支持 8 位灰度/RGB/RGBA/调色板） */
export function decodePng(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error('不是 PNG：' + file);
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  let palette = null;
  const chunks = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const body = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      bitDepth = body[8];
      colorType = body[9];
      interlace = body[12];
    } else if (type === 'PLTE') {
      palette = Buffer.from(body);
    } else if (type === 'IDAT') {
      chunks.push(Buffer.from(body));
    }
    offset += 12 + length;
    if (type === 'IEND') break;
  }
  if (bitDepth !== 8) throw new Error(`暂不支持位深 ${bitDepth}：${file}`);
  if (interlace !== 0) throw new Error('暂不支持交错 PNG');
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error('不支持的颜色类型 ' + colorType);
  const raw = zlib.inflateSync(Buffer.concat(chunks));
  const stride = width * channels;
  const out = Buffer.alloc(stride * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const start = y * stride;
    const prev = start - stride;
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? out[start + x - channels] : 0;
      const up = y > 0 ? out[prev + x] : 0;
      const upLeft = y > 0 && x >= channels ? out[prev + x - channels] : 0;
      const value = line[x];
      switch (filter) {
        case 0: out[start + x] = value; break;
        case 1: out[start + x] = (value + left) & 0xff; break;
        case 2: out[start + x] = (value + up) & 0xff; break;
        case 3: out[start + x] = (value + ((left + up) >> 1)) & 0xff; break;
        case 4: out[start + x] = (value + paeth(left, up, upLeft)) & 0xff; break;
        default: throw new Error('未知过滤器 ' + filter);
      }
    }
  }
  if (colorType === 3) {
    if (!palette) throw new Error('调色板 PNG 缺少 PLTE');
    const rgb = Buffer.alloc(width * height * 3);
    for (let i = 0; i < width * height; i++) {
      const index = out[i] * 3;
      rgb[i * 3] = palette[index];
      rgb[i * 3 + 1] = palette[index + 1];
      rgb[i * 3 + 2] = palette[index + 2];
    }
    return { width, height, channels: 3, data: rgb };
  }
  if (colorType === 0) {
    const rgb = Buffer.alloc(width * height * 3);
    for (let i = 0; i < width * height; i++) {
      rgb[i * 3] = out[i]; rgb[i * 3 + 1] = out[i]; rgb[i * 3 + 2] = out[i];
    }
    return { width, height, channels: 3, data: rgb };
  }
  if (colorType === 4) {
    const rgb = Buffer.alloc(width * height * 3);
    for (let i = 0; i < width * height; i++) {
      rgb[i * 3] = out[i * 2]; rgb[i * 3 + 1] = out[i * 2]; rgb[i * 3 + 2] = out[i * 2];
    }
    return { width, height, channels: 3, data: rgb };
  }
  return { width, height, channels, data: out };
}

/**
 * 逐像素比较两张同尺寸截图。
 * 返回差异统计：总差异像素、按行的差异区间、差异像素颜色示例、忽略指定矩形后的差异数。
 */
export function comparePng(fileA, fileB, { ignore = [] } = {}) {
  const a = decodePng(fileA);
  const b = decodePng(fileB);
  if (a.width !== b.width || a.height !== b.height) {
    return { sameSize: false, sizeA: [a.width, a.height], sizeB: [b.width, b.height] };
  }
  const ignored = (x, y) => ignore.some((box) => x >= box.x && x < box.x + box.w && y >= box.y && y < box.y + box.h);
  let diff = 0;
  let ignoredDiff = 0;
  let minX = Infinity; let minY = Infinity; let maxX = -1; let maxY = -1;
  const rows = new Map();
  const colors = new Map();
  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const i = (y * a.width + x) * a.channels;
      const j = (y * b.width + x) * b.channels;
      if (a.data[i] === b.data[j] && a.data[i + 1] === b.data[j + 1] && a.data[i + 2] === b.data[j + 2]) continue;
      if (ignored(x, y)) { ignoredDiff++; continue; }
      diff++;
      rows.set(y, (rows.get(y) ?? 0) + 1);
      const key = `${b.data[j]},${b.data[j + 1]},${b.data[j + 2]}`;
      colors.set(key, (colors.get(key) ?? 0) + 1);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const rowList = [...rows.keys()].sort((p, q) => p - q);
  const bands = [];
  for (const y of rowList) {
    const last = bands[bands.length - 1];
    if (last && y === last.to + 1) { last.to = y; last.pixels += rows.get(y); } else bands.push({ from: y, to: y, pixels: rows.get(y) });
  }
  return {
    sameSize: true,
    size: [a.width, a.height],
    diff,
    ignoredDiff,
    bounds: diff ? { minX, minY, maxX, maxY } : null,
    bands,
    colors: [...colors.entries()].sort((p, q) => q[1] - p[1]).slice(0, 4).map(([key, count]) => ({ rgb: key, count })),
  };
}
