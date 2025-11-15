// Simple script to create placeholder PWA icons
// Run with: node scripts/generate-icons.js

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a simple SVG icon and save as PNG placeholder
function createIconSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#4CAF50"/>

  <!-- Egg shape -->
  <ellipse cx="${size / 2}" cy="${size * 0.55}" rx="${size * 0.27}" ry="${size * 0.35}" fill="#FFFFFF"/>

  <!-- Highlight -->
  <ellipse cx="${size * 0.4}" cy="${size * 0.42}" rx="${size * 0.08}" ry="${size * 0.12}" fill="#FFFFFF" opacity="0.4"/>

  <!-- Text -->
  <text x="${size / 2}" y="${size * 0.9}" font-family="Arial, sans-serif" font-size="${size * 0.12}" fill="#FFFFFF" text-anchor="middle" font-weight="bold">EGG TIMER</text>
</svg>`;
}

// Create icon files
const sizes = [192, 512];

sizes.forEach((size) => {
  const svg = createIconSVG(size);
  const filename = resolve(
    __dirname,
    '..',
    'public',
    `icon-${size}.svg`
  );
  writeFileSync(filename, svg);
  console.log(`Created ${filename}`);
});

console.log('\nNote: For production, convert SVG to PNG using an image converter.');
console.log('You can use the generate-icons.html file in a browser to create PNG files.');
