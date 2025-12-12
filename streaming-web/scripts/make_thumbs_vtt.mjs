import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const dir = path.resolve(projectRoot, '../ffout/thumbs_vtt');
const step = 2;
const files = fs
  .readdirSync(dir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /^thumb_\d+\.jpg$/.test(entry.name))
  .map((entry) => entry.name)
  .sort();

let t = 0;
let out = 'WEBVTT\n\n';
for (const file of files) {
  const s = new Date(t * 1000).toISOString().slice(11, 23);
  const e = new Date((t + step) * 1000).toISOString().slice(11, 23);
  out += `${s} --> ${e}\n${file}\n\n`;
  t += step;
}

const outputPath = path.resolve(dir, 'thumbs.vtt');
fs.writeFileSync(outputPath, out);
console.log('Wrote', outputPath);
