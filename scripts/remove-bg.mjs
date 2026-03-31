import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const input  = path.join(__dirname, '../src/image/Gemini_Generated_Image_wm4oh7wm4oh7wm4o.png');
const output = path.join(__dirname, '../src/image/logo.png');

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const pixels = new Uint8Array(data);

const idx = (x, y) => (y * width + x) * channels;

// Sample background colors from all 4 corners
const sampleBg = (x, y) => {
  const i = idx(x, y);
  return { r: pixels[i], g: pixels[i+1], b: pixels[i+2] };
};

const isBackground = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  // Light gray / white checkerboard with low saturation
  return r > 140 && g > 140 && b > 140 && saturation < 0.15;
};

// BFS flood fill from all 4 corners
const visited = new Uint8Array(width * height);
const queue = [];

const corners = [
  [0, 0], [width - 1, 0],
  [0, height - 1], [width - 1, height - 1],
];

for (const [x, y] of corners) {
  const i = idx(x, y);
  if (!visited[y * width + x] && isBackground(pixels[i], pixels[i+1], pixels[i+2])) {
    queue.push([x, y]);
    visited[y * width + x] = 1;
  }
}

const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

while (queue.length > 0) {
  const [cx, cy] = queue.pop();
  pixels[idx(cx, cy) + 3] = 0; // transparent

  for (const [dx, dy] of dirs) {
    const nx = cx + dx;
    const ny = cy + dy;
    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
    if (visited[ny * width + nx]) continue;
    const ni = idx(nx, ny);
    if (isBackground(pixels[ni], pixels[ni+1], pixels[ni+2])) {
      visited[ny * width + nx] = 1;
      queue.push([nx, ny]);
    }
  }
}

await sharp(pixels, { raw: { width, height, channels } })
  .png()
  .toFile(output);

console.log('Done → src/image/logo.png');
