// Downloads a picture, shrinks it, removes its metadata and saves it for a project.
// Usage: npm run add:image -- <image url> <project id> <name>
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [url, project, name] = process.argv.slice(2);
if (!url || !project || !/^[a-z0-9-]+$/.test(name ?? "")) {
  console.error("Usage: npm run add:image -- <image url> <project id> <name>");
  process.exit(1);
}

const response = await fetch(url, {
  headers: { "user-agent": "ApogeeContentTool/1.0 (student club learning site)" },
  signal: AbortSignal.timeout(60000),
});
if (!response.ok) {
  console.error(`Download failed: ${response.status}`);
  process.exit(1);
}

const folder = path.join(process.cwd(), "public", "media", project);
fs.mkdirSync(folder, { recursive: true });
const file = path.join(folder, `${name}.jpg`);

const info = await sharp(Buffer.from(await response.arrayBuffer()))
  .rotate()
  .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
  .flatten({ background: "#0c0c0d" })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(file);

console.log(`/media/${project}/${name}.jpg  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
