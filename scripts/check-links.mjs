// Checks every URL and YouTube video in the curriculum, and exits with an error if any is broken.
// Pass a prefix to check some projects only: npm run check:links -- web-
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "projects");
const urls = new Map();

const add = (url, file) => urls.set(url, [...(urls.get(url) ?? []), file]);

function collect(value, file) {
  if (typeof value === "string" && /^https?:\/\//.test(value)) {
    add(value, file);
  } else if (value && typeof value === "object") {
    // YouTube answers this address only for videos that exist and allow embedding.
    if (value.youtubeId) {
      add(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${value.youtubeId}`, file);
    }
    Object.values(value).forEach((item) => collect(item, file));
  }
}

const prefix = process.argv[2] ?? "";
for (const file of fs.readdirSync(dir).filter((name) => name.startsWith(prefix))) {
  collect(JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")), file);
}

async function check(url) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
      headers: { "user-agent": "Mozilla/5.0 (link checker)" },
    });
    return response.status;
  } catch (error) {
    return error.name;
  }
}

const entries = [...urls.keys()];
const broken = [];
for (let i = 0; i < entries.length; i += 8) {
  const batch = entries.slice(i, i + 8);
  const results = await Promise.all(batch.map(check));
  batch.forEach((url, index) => {
    if (results[index] !== 200) broken.push({ url, result: results[index] });
  });
}

console.log(`Checked ${entries.length} links, ${broken.length} broken.`);
for (const { url, result } of broken) {
  console.log(`  ${result}  ${url}  (${urls.get(url).join(", ")})`);
}
process.exit(broken.length ? 1 : 0);
