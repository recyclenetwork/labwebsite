import sharp from "sharp";
import fs from "fs";
import path from "path";

const svgPath = path.resolve("src/app/icon.svg");
const svgBuffer = fs.readFileSync(svgPath);

async function generateFavicons() {
  console.log("Rendering LabEHE PNGs from SVG...");

  // 1. 32x32 PNG for favicon
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  // 2. 64x64 PNG
  const png64 = await sharp(svgBuffer).resize(64, 64).png().toBuffer();
  // 3. 180x180 Apple Touch Icon
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  // 4. 512x512 High Res Icon
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();

  fs.writeFileSync("public/apple-touch-icon.png", png180);
  fs.writeFileSync("src/app/apple-icon.png", png180);
  fs.writeFileSync("public/icon-512.png", png512);
  fs.writeFileSync("public/icon-192.png", png64);

  // Pack 32x32 PNG into valid Windows/Browser ICO format
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // image type (1 = ICO)
  header.writeUInt16LE(1, 4); // count of images (1)

  // Directory entry: 16 bytes
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2);  // color palette (0 = no palette)
  entry.writeUInt8(0, 3);  // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png32.length, 8); // size of PNG image data
  entry.writeUInt32LE(22, 12); // offset of image data (6 + 16 = 22)

  const icoBuffer = Buffer.concat([header, entry, png32]);
  fs.writeFileSync("src/app/favicon.ico", icoBuffer);
  fs.writeFileSync("public/favicon.ico", icoBuffer);

  console.log("✅ Successfully generated LabEHE favicon.ico, apple-icon.png, and icon PNGs!");
}

generateFavicons().catch(console.error);
