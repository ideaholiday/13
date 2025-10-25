#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create a simple PNG icon generator
function createIcon(size) {
  // This is a placeholder - in production, you'd use a proper image generation library
  // For now, we'll create a simple colored square as a placeholder
  
  const canvas = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${size}" height="${size}" fill="#1e3a8a" rx="${size * 0.1}"/>
      
      <!-- Inner Circle -->
      <circle cx="${size/2}" cy="${size/2}" r="${size * 0.35}" fill="#3b82f6"/>
      
      <!-- Plane Icon -->
      <g transform="translate(${size * 0.3}, ${size * 0.3})">
        <!-- Plane Body -->
        <path d="M${size * 0.2} ${size * 0.2} L${size * 0.28} ${size * 0.2} L${size * 0.3} ${size * 0.24} L${size * 0.28} ${size * 0.28} L${size * 0.2} ${size * 0.28} Z" fill="white" opacity="0.9"/>
        
        <!-- Plane Wings -->
        <path d="M${size * 0.24} ${size * 0.16} L${size * 0.32} ${size * 0.2} L${size * 0.24} ${size * 0.24} Z" fill="white" opacity="0.8"/>
        <path d="M${size * 0.24} ${size * 0.24} L${size * 0.32} ${size * 0.28} L${size * 0.24} ${size * 0.32} Z" fill="white" opacity="0.8"/>
        
        <!-- Plane Tail -->
        <path d="M${size * 0.2} ${size * 0.24} L${size * 0.16} ${size * 0.22} L${size * 0.16} ${size * 0.26} Z" fill="white" opacity="0.7"/>
        
        <!-- Window -->
        <circle cx="${size * 0.26}" cy="${size * 0.24}" r="${size * 0.016}" fill="#1e3a8a" opacity="0.6"/>
      </g>
      
      <!-- Decorative Elements -->
      <circle cx="${size * 0.2}" cy="${size * 0.2}" r="${size * 0.008}" fill="white" opacity="0.3"/>
      <circle cx="${size * 0.8}" cy="${size * 0.24}" r="${size * 0.006}" fill="white" opacity="0.4"/>
      <circle cx="${size * 0.16}" cy="${size * 0.8}" r="${size * 0.01}" fill="white" opacity="0.2"/>
      <circle cx="${size * 0.84}" cy="${size * 0.76}" r="${size * 0.008}" fill="white" opacity="0.3"/>
    </svg>
  `;
  
  return canvas;
}

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
sizes.forEach(size => {
  const iconSvg = createIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, iconSvg);
  console.log(`Generated ${filename}`);
});

// Create shortcut icons
const shortcuts = [
  { name: 'flight-shortcut', color: '#3b82f6' },
  { name: 'hotel-shortcut', color: '#10b981' },
  { name: 'package-shortcut', color: '#f59e0b' }
];

shortcuts.forEach(shortcut => {
  const iconSvg = createIcon(96).replace('#3b82f6', shortcut.color);
  const filename = `${shortcut.name}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, iconSvg);
  console.log(`Generated ${filename}`);
});

console.log('All icons generated successfully!');
console.log('Note: These are SVG placeholders. For production, convert to PNG using a tool like ImageMagick or online converters.');
