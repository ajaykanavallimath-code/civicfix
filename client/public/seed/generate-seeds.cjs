const fs = require('fs');
const path = require('path');

const seedDir = path.join(__dirname);

function createSvg(title, subtitle, color, iconType) {
  let iconSvg = '';
  if (iconType === 'pothole') {
    iconSvg = `<path d="M40 160 Q80 120 160 140 T280 150 Q340 170 360 190 T240 210 Q140 220 80 190 Z" fill="#2d3748" opacity="0.8"/><circle cx="150" cy="170" r="25" fill="#1a202c"/><circle cx="230" cy="180" r="18" fill="#1a202c"/>`;
  } else if (iconType === 'water') {
    iconSvg = `<path d="M200 80 C200 80 130 180 130 220 C130 258 161 290 200 290 C238 290 270 258 270 220 C270 180 200 80 200 80 Z" fill="#38bdf8"/><path d="M170 210 Q200 240 200 270" stroke="#bae6fd" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  } else if (iconType === 'garbage') {
    iconSvg = `<rect x="130" y="140" width="140" height="150" rx="12" fill="#78716c"/><path d="M110 120 L290 120 L270 95 L130 95 Z" fill="#57534e"/><line x1="170" y1="160" x2="170" y2="260" stroke="#44403c" stroke-width="8"/><line x1="200" y1="160" x2="200" y2="260" stroke="#44403c" stroke-width="8"/><line x1="230" y1="160" x2="230" y2="260" stroke="#44403c" stroke-width="8"/>`;
  } else if (iconType === 'streetlight') {
    iconSvg = `<rect x="190" y="80" width="20" height="220" fill="#64748b"/><path d="M170 80 L230 80 L215 50 L185 50 Z" fill="#475569"/><circle cx="200" cy="90" r="16" fill="#fbbf24"/><circle cx="200" cy="90" r="35" fill="#fde68a" opacity="0.3"/>`;
  } else if (iconType === 'sewage') {
    iconSvg = `<circle cx="200" cy="200" r="80" fill="#475569"/><circle cx="200" cy="200" r="60" fill="#334155"/><path d="M160 170 Q200 200 240 170 M160 210 Q200 240 240 210" stroke="#059669" stroke-width="8" fill="none"/>`;
  } else if (iconType === 'resolved') {
    iconSvg = `<circle cx="200" cy="180" r="70" fill="#10b981"/><path d="M165 180 L190 205 L235 155" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  } else {
    iconSvg = `<polygon points="200,80 270,220 130,220" fill="#f97316"/><line x1="200" y1="130" x2="200" y2="180" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/><circle cx="200" cy="202" r="6" fill="#ffffff"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color[0]}"/>
      <stop offset="100%" stop-color="${color[1]}"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15"/>
    </filter>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <rect x="20" y="20" width="360" height="260" rx="16" fill="#ffffff" fill-opacity="0.92" filter="url(#shadow)"/>
  <g transform="translate(0, -10)">
    ${iconSvg}
  </g>
  <text x="200" y="240" font-family="Inter, system-ui, sans-serif" font-size="17" font-weight="700" fill="#0B1F3A" text-anchor="middle">${title}</text>
  <text x="200" y="262" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="500" fill="#64748B" text-anchor="middle">${subtitle}</text>
</svg>`;
}

const images = [
  { name: 'pothole-1.svg', title: 'Severe Road Pothole', sub: 'Court Road, Savanur', color: ['#cbd5e1', '#94a3b8'], type: 'pothole' },
  { name: 'pothole-2.svg', title: 'Deep Crater on Bus Route', sub: 'Near KSRTC Bus Stand', color: ['#fed7aa', '#fdba74'], type: 'pothole' },
  { name: 'water-leak-1.svg', title: 'Major Drinking Water Pipe Burst', sub: 'APMC Market Road, Savanur', color: ['#bae6fd', '#7dd3fc'], type: 'water' },
  { name: 'water-leak-2.svg', title: 'Municipal Pipeline Seepage', sub: 'Ward 3, PB Road, Haveri', color: ['#e0f2fe', '#bae6fd'], type: 'water' },
  { name: 'garbage-1.svg', title: 'Overflowing Waste Dump', sub: 'Govt School Perimeter, Savanur', color: ['#fed7aa', '#fca5a5'], type: 'garbage' },
  { name: 'garbage-2.svg', title: 'Uncollected Commercial Waste', sub: 'Gandhi Chowk, Haveri', color: ['#fef08a', '#fde047'], type: 'garbage' },
  { name: 'streetlight-1.svg', title: 'Dark Intersection - Broken Pole', sub: 'KIMS Vidyanagar Junction', color: ['#fef3c7', '#fde68a'], type: 'streetlight' },
  { name: 'streetlight-2.svg', title: 'Sparking Pole Wire', sub: 'Railway Feeder Road, Haveri', color: ['#fef08a', '#fdba74'], type: 'streetlight' },
  { name: 'sewage-1.svg', title: 'Open Manhole & Sullage Flow', sub: 'Hospital Cross Road, Savanur', color: ['#fed7aa', '#f87171'], type: 'sewage' },
  { name: 'road-damage-1.svg', title: 'Caved Asphalt Edge', sub: 'Haveri-Savanur SH 40', color: ['#e2e8f0', '#cbd5e1'], type: 'pothole' },
  { name: 'pollution-1.svg', title: 'Industrial Effluent Discharge', sub: 'Tarihal Industrial Estate, Hubballi', color: ['#fecdd3', '#fda4af'], type: 'other' },
  { name: 'resolved-pothole.svg', title: 'Road Resurfaced & Compacted', sub: 'PWD Haveri Verification Log', color: ['#d1fae5', '#a7f3d0'], type: 'resolved' },
  { name: 'resolved-water.svg', title: 'Pipeline Replaced & Valve Tested', sub: 'KUWS&DB Technical Team', color: ['#d1fae5', '#a7f3d0'], type: 'resolved' },
  { name: 'resolved-garbage.svg', title: 'Debris Cleared & Sanitized', sub: 'Savanur TMC Sanitation Squad', color: ['#d1fae5', '#a7f3d0'], type: 'resolved' }
];

images.forEach(img => {
  const content = createSvg(img.title, img.sub, img.color, img.type);
  fs.writeFileSync(path.join(seedDir, img.name), content, 'utf8');
});

console.log(`Generated ${images.length} seed images in ${seedDir}`);
