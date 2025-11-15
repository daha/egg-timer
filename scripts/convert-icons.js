#!/usr/bin/env node
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

async function convertSvgToPng() {
  try {
    console.log('Converting SVG icons to PNG...\n');

    // Convert icon-192.svg to icon-192.png
    const svg192 = readFileSync(join(publicDir, 'icon-192.svg'));
    await sharp(svg192)
      .resize(192, 192)
      .png()
      .toFile(join(publicDir, 'icon-192.png'));
    console.log('✓ Created icon-192.png');

    // Convert icon-512.svg to icon-512.png
    const svg512 = readFileSync(join(publicDir, 'icon-512.svg'));
    await sharp(svg512)
      .resize(512, 512)
      .png()
      .toFile(join(publicDir, 'icon-512.png'));
    console.log('✓ Created icon-512.png');

    // Create apple-touch-icon.png (180x180) from icon-192.svg
    await sharp(svg192)
      .resize(180, 180)
      .png()
      .toFile(join(publicDir, 'apple-touch-icon.png'));
    console.log('✓ Created apple-touch-icon.png (180x180)');

    console.log('\n✅ All PNG icons generated successfully!');
  } catch (error) {
    console.error('❌ Error generating PNG icons:', error);
    process.exit(1);
  }
}

convertSvgToPng();
