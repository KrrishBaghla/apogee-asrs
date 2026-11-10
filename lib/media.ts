import fs from "node:fs";
import path from "node:path";

// Reads a JPEG's size from its header, so pictures keep their shape and the page doesn't jump.
// Cached because reading a binary file touches the clock, which isn't allowed while prerendering.
export async function jpegSize(src: string): Promise<{ width: number; height: number }> {
  "use cache";

  const data = fs.readFileSync(path.join(process.cwd(), "public", src));
  let offset = 2;
  while (offset + 9 < data.length) {
    const marker = data[offset + 1];
    const isFrameHeader = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isFrameHeader) {
      return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) };
    }
    offset += 2 + data.readUInt16BE(offset + 2);
  }
  throw new Error(`No size found in ${src}`);
}
