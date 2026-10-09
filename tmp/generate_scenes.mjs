import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const OUT_DIR = '/tmp/video_scenes';
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function svgWrapper(content, title, subtitle, narrationText, partLabel = 'DSA TREE LESSON') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" style="background:#070B16; font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,sans-serif;">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070A14"/>
      <stop offset="50%" stop-color="#0B1021"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="rootGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#6D28D9"/>
    </linearGradient>
    <linearGradient id="parentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <linearGradient id="highlightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.9"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bgGrad)"/>

  <!-- Subtle Decorative Grid Lines -->
  <g opacity="0.08" stroke="#6366F1" stroke-width="1">
    <line x1="0" y1="120" x2="1280" y2="120"/>
    <line x1="0" y1="240" x2="1280" y2="240"/>
    <line x1="0" y1="360" x2="1280" y2="360"/>
    <line x1="0" y1="480" x2="1280" y2="480"/>
    <line x1="0" y1="600" x2="1280" y2="600"/>
    <line x1="256" y1="0" x2="256" y2="720"/>
    <line x1="512" y1="0" x2="512" y2="720"/>
    <line x1="768" y1="0" x2="768" y2="720"/>
    <line x1="1024" y1="0" x2="1024" y2="720"/>
  </g>

  <!-- Ambient Glow Blobs -->
  <circle cx="200" cy="180" r="180" fill="#4F46E5" opacity="0.06" filter="url(#glow)"/>
  <circle cx="1080" cy="400" r="220" fill="#7C3AED" opacity="0.06" filter="url(#glow)"/>

  <!-- TOP HEADER BAR -->
  <rect x="0" y="0" width="1280" height="85" fill="#060913" fill-opacity="0.95"/>
  <line x1="0" y1="85" x2="1280" y2="85" stroke="#1E293B" stroke-width="1.5"/>

  <!-- Brand & Topic Tag -->
  <rect x="40" y="24" width="135" height="36" rx="8" fill="#1E1B4B" stroke="#4338CA" stroke-width="1.5"/>
  <text x="107" y="47" fill="#A5B4FC" font-size="13" font-weight="800" letter-spacing="1.5" text-anchor="middle">ALGOLEARN</text>

  <rect x="185" y="24" width="190" height="36" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
  <text x="280" y="47" fill="#38BDF8" font-size="12" font-weight="700" letter-spacing="1" text-anchor="middle">${partLabel}</text>

  <!-- Header Titles -->
  <text x="400" y="44" fill="#FFFFFF" font-size="22" font-weight="800">${title}</text>
  <text x="400" y="66" fill="#94A3B8" font-size="13" font-weight="500">${subtitle}</text>

  <!-- Visual Lesson Badge Right -->
  <rect x="1100" y="24" width="140" height="36" rx="8" fill="#312E81" fill-opacity="0.6" stroke="#6366F1" stroke-width="1"/>
  <circle cx="1120" cy="42" r="5" fill="#10B981"/>
  <text x="1178" y="47" fill="#E0E7FF" font-size="12" font-weight="700" text-anchor="middle">VISUAL GUIDE</text>

  <!-- MAIN CANVAS AREA (y: 95 to 610) -->
  ${content}

  <!-- BOTTOM NARRATION / SUBTITLE BAR (Clear, separated, NEVER overlaps diagram) -->
  <rect x="40" y="625" width="1200" height="72" rx="16" fill="#0B0F19" fill-opacity="0.95" stroke="#334155" stroke-width="1.5"/>
  <rect x="52" y="637" width="34" height="48" rx="8" fill="#4F46E5" fill-opacity="0.3"/>
  <text x="69" y="666" fill="#818CF8" font-size="16" font-weight="bold" text-anchor="middle">🎙</text>

  <text x="102" y="654" fill="#94A3B8" font-size="11" font-weight="700" letter-spacing="1">AUDIO NARRATION</text>
  <text x="102" y="677" fill="#FFFFFF" font-size="16" font-weight="600">${narrationText}</text>
</svg>`;
}

// Helper for drawing an edge
function edge(x1, y1, x2, y2, color = '#64748B', width = 3, dashed = false) {
  const dashAttr = dashed ? 'stroke-dasharray="6,6"' : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${dashAttr}/>`;
}

// Helper for drawing a tree node (radius 30, perfectly legible)
function node(cx, cy, val, fill = 'url(#parentGrad)', stroke = '#93C5FD', textColor = '#FFFFFF') {
  return `<g>
    <circle cx="${cx}" cy="${cy}" r="28" fill="${fill}" stroke="${stroke}" stroke-width="2.5" filter="url(#glow)"/>
    <text x="${cx}" y="${cy + 6}" fill="${textColor}" font-size="16" font-weight="800" text-anchor="middle" dominant-baseline="middle">${val}</text>
  </g>`;
}

// Helper for a callout badge with leader line
function callout(x, y, text, bg = '#1E1B4B', border = '#6366F1', textColor = '#C7D2FE', lineTo = null) {
  let leaderLine = '';
  if (lineTo) {
    leaderLine = `<line x1="${x}" y1="${y}" x2="${lineTo.x}" y2="${lineTo.y}" stroke="${border}" stroke-width="1.5" stroke-dasharray="3,3"/>`;
  }
  const w = text.length * 8.5 + 24;
  return `${leaderLine}
  <g>
    <rect x="${x - w / 2}" y="${y - 15}" width="${w}" height="30" rx="8" fill="${bg}" stroke="${border}" stroke-width="1.5"/>
    <text x="${x}" y="${y + 5}" fill="${textColor}" font-size="12" font-weight="800" text-anchor="middle">${text}</text>
  </g>`;
}

console.log('Generating high-resolution scenes...');

// =========================================================================
// SCENE 01: Simple Tree Introduction (0.0s - 4.5s)
// =========================================================================
const s1 = svgWrapper(`
  <!-- Left Side: Explanation Card -->
  <g>
    <rect x="60" y="140" width="360" height="440" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <rect x="85" y="165" width="120" height="28" rx="6" fill="#312E81" stroke="#4338CA" stroke-width="1"/>
    <text x="145" y="184" fill="#C7D2FE" font-size="12" font-weight="800" text-anchor="middle">HIERARCHY</text>
    
    <text x="85" y="225" fill="#FFFFFF" font-size="20" font-weight="800">What is a Tree?</text>
    <text x="85" y="260" fill="#CBD5E1" font-size="14" font-weight="400">A non-linear hierarchical data</text>
    <text x="85" y="285" fill="#CBD5E1" font-size="14" font-weight="400">structure composed of connected</text>
    <text x="85" y="310" fill="#CBD5E1" font-size="14" font-weight="400">elements called nodes.</text>

    <!-- Key Components List -->
    <rect x="85" y="340" width="310" height="50" rx="10" fill="#0B132B" stroke="#1E293B" stroke-width="1"/>
    <circle cx="105" cy="365" r="7" fill="#8B5CF6"/>
    <text x="125" y="370" fill="#F8FAFC" font-size="14" font-weight="700">Root Node: Topmost starting point</text>

    <rect x="85" y="405" width="310" height="50" rx="10" fill="#0B132B" stroke="#1E293B" stroke-width="1"/>
    <circle cx="105" cy="430" r="7" fill="#3B82F6"/>
    <text x="125" y="435" fill="#F8FAFC" font-size="14" font-weight="700">Edges: Links connecting elements</text>

    <rect x="85" y="470" width="310" height="50" rx="10" fill="#0B132B" stroke="#1E293B" stroke-width="1"/>
    <circle cx="105" cy="495" r="7" fill="#10B981"/>
    <text x="125" y="500" fill="#F8FAFC" font-size="14" font-weight="700">Parent &amp; Child: Natural hierarchy</text>
  </g>

  <!-- Right Side: Tree Diagram Canvas -->
  <g>
    <rect x="460" y="140" width="760" height="440" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

    <!-- Edges -->
    ${edge(840, 220, 700, 340, '#818CF8', 3.5)}
    ${edge(840, 220, 980, 340, '#818CF8', 3.5)}
    ${edge(700, 340, 620, 470, '#64748B', 3)}
    ${edge(700, 340, 780, 470, '#64748B', 3)}

    <!-- Nodes -->
    ${node(840, 220, '10', 'url(#rootGrad)', '#DDD6FE')}
    ${node(700, 340, '5', 'url(#parentGrad)', '#BFDBFE')}
    ${node(980, 340, '20', 'url(#leafGrad)', '#A7F3D0')}
    ${node(620, 470, '2', 'url(#leafGrad)', '#A7F3D0')}
    ${node(780, 470, '7', 'url(#leafGrad)', '#A7F3D0')}

    <!-- Dedicated Callout Badges with zero overlap -->
    ${callout(840, 160, 'ROOT NODE (Topmost)', '#3B0764', '#A855F7', '#F3E8FF', { x: 840, y: 190 })}
    ${callout(600, 340, 'PARENT NODE', '#1E1B4B', '#3B82F6', '#DBEAFE', { x: 670, y: 340 })}
    ${callout(1070, 340, 'CHILD OF 10', '#064E3B', '#10B981', '#D1FAE5', { x: 1010, y: 340 })}
    ${callout(700, 535, 'CHILDREN OF 5 (2 &amp; 7)', '#064E3B', '#10B981', '#D1FAE5', { x: 700, y: 500 })}
  </g>
`, 'Tree Fundamentals', 'A tree branches out from a single top node called the root', '"This is a simple tree. The top node is called the root."');

fs.writeFileSync(path.join(OUT_DIR, 'scene01.svg'), s1);

// =========================================================================
// SCENE 02: Parent & Child Relationship Focus (4.5s - 9.5s)
// =========================================================================
const s2 = svgWrapper(`
  <!-- Left Side: Explanation Card -->
  <g>
    <rect x="60" y="140" width="360" height="440" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <rect x="85" y="165" width="160" height="28" rx="6" fill="#1E3A8A" stroke="#2563EB" stroke-width="1"/>
    <text x="165" y="184" fill="#BFDBFE" font-size="12" font-weight="800" text-anchor="middle">RELATIONSHIPS</text>
    
    <text x="85" y="225" fill="#FFFFFF" font-size="20" font-weight="800">Parent &amp; Child Nodes</text>
    
    <rect x="85" y="255" width="310" height="85" rx="10" fill="#0B132B" stroke="#2563EB" stroke-width="1.5"/>
    <text x="105" y="282" fill="#60A5FA" font-size="14" font-weight="700">Node [5] = Parent Node</text>
    <text x="105" y="306" fill="#CBD5E1" font-size="13">A node directly above another node,</text>
    <text x="105" y="326" fill="#CBD5E1" font-size="13">connected by downward edges.</text>

    <rect x="85" y="355" width="310" height="85" rx="10" fill="#0B132B" stroke="#10B981" stroke-width="1.5"/>
    <text x="105" y="382" fill="#34D399" font-size="14" font-weight="700">Nodes [2, 7] = Children</text>
    <text x="105" y="406" fill="#CBD5E1" font-size="13">Nodes directly beneath parent [5].</text>
    <text x="105" y="426" fill="#CBD5E1" font-size="13">Nodes 2 and 7 are also Siblings.</text>

    <rect x="85" y="460" width="310" height="60" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1"/>
    <text x="105" y="485" fill="#F8FAFC" font-size="13" font-weight="700">Rule of Hierarchy:</text>
    <text x="105" y="505" fill="#94A3B8" font-size="12">Every child has exactly ONE parent.</text>
  </g>

  <!-- Right Side: Tree Diagram Canvas with Highlighting -->
  <g>
    <rect x="460" y="140" width="760" height="440" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

    <!-- Edges -->
    ${edge(840, 220, 700, 340, '#475569', 2.5)}
    ${edge(840, 220, 980, 340, '#475569', 2.5)}
    ${edge(700, 340, 620, 470, '#38BDF8', 4)}
    ${edge(700, 340, 780, 470, '#38BDF8', 4)}

    <!-- Nodes -->
    ${node(840, 220, '10', '#1E293B', '#475569', '#94A3B8')}
    ${node(700, 340, '5', 'url(#parentGrad)', '#93C5FD')}
    ${node(980, 340, '20', '#1E293B', '#475569', '#94A3B8')}
    ${node(620, 470, '2', 'url(#leafGrad)', '#A7F3D0')}
    ${node(780, 470, '7', 'url(#leafGrad)', '#A7F3D0')}

    <!-- Highlights -->
    ${callout(700, 280, 'PARENT NODE [5]', '#1E3A8A', '#3B82F6', '#DBEAFE', { x: 700, y: 310 })}
    ${callout(620, 530, 'CHILD [2]', '#064E3B', '#10B981', '#D1FAE5', { x: 620, y: 500 })}
    ${callout(780, 530, 'CHILD [7]', '#064E3B', '#10B981', '#D1FAE5', { x: 780, y: 500 })}
    ${callout(700, 430, 'PARENT-CHILD EDGES', '#0F172A', '#38BDF8', '#E0F2FE')}
    ${callout(1050, 470, 'SIBLINGS: Nodes sharing Parent [5]', '#312E81', '#818CF8', '#EEF2FF')}
  </g>
`, 'Node Relationships', '5 is a parent of 2 and 7; nodes 2 and 7 are children and siblings', '"5 is a parent of 2 and 7."');

fs.writeFileSync(path.join(OUT_DIR, 'scene02.svg'), s2);

// =========================================================================
// SCENE 03: Tree Terminology — Nodes, Root, Edges (9.5s - 16.5s)
// =========================================================================
const s3 = svgWrapper(`
  <g>
    <!-- Left Column: Terminology Definition Table -->
    <rect x="60" y="140" width="400" height="440" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="180" fill="#FFFFFF" font-size="20" font-weight="800">Essential Tree Terms</text>

    <g transform="translate(85, 205)">
      <rect width="350" height="65" rx="10" fill="#1E1B4B" stroke="#6366F1" stroke-width="1.5"/>
      <circle cx="25" cy="32" r="14" fill="#8B5CF6"/>
      <text x="25" y="37" fill="#FFF" font-size="12" font-weight="800" text-anchor="middle">1</text>
      <text x="50" y="27" fill="#A5B4FC" font-size="14" font-weight="800">NODE</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Each individual data-holding element</text>
    </g>

    <g transform="translate(85, 285)">
      <rect width="350" height="65" rx="10" fill="#3B0764" stroke="#A855F7" stroke-width="1.5"/>
      <circle cx="25" cy="32" r="14" fill="#7C3AED"/>
      <text x="25" y="37" fill="#FFF" font-size="12" font-weight="800" text-anchor="middle">2</text>
      <text x="50" y="27" fill="#F0ABFC" font-size="14" font-weight="800">ROOT</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">The top node with no parent (Node A)</text>
    </g>

    <g transform="translate(85, 365)">
      <rect width="350" height="65" rx="10" fill="#0C4A6E" stroke="#0284C7" stroke-width="1.5"/>
      <circle cx="25" cy="32" r="14" fill="#0284C7"/>
      <text x="25" y="37" fill="#FFF" font-size="12" font-weight="800" text-anchor="middle">3</text>
      <text x="50" y="27" fill="#7DD3FC" font-size="14" font-weight="800">EDGE</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Connecting line between any two nodes</text>
    </g>

    <g transform="translate(85, 445)">
      <rect width="350" height="65" rx="10" fill="#064E3B" stroke="#059669" stroke-width="1.5"/>
      <circle cx="25" cy="32" r="14" fill="#059669"/>
      <text x="25" y="37" fill="#FFF" font-size="12" font-weight="800" text-anchor="middle">4</text>
      <text x="50" y="27" fill="#6EE7B7" font-size="14" font-weight="800">SIBLINGS</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Nodes sharing the same parent (D &amp; E)</text>
    </g>

    <!-- Right Column: Diagram with Clear Markers -->
    <rect x="500" y="140" width="720" height="440" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

    <!-- Edges with Labels -->
    ${edge(860, 220, 720, 340, '#38BDF8', 3.5)}
    ${edge(860, 220, 1000, 340, '#38BDF8', 3.5)}
    ${edge(720, 340, 640, 470, '#38BDF8', 3.5)}
    ${edge(720, 340, 800, 470, '#38BDF8', 3.5)}

    <!-- Edge Labels positioned midway with clearance -->
    <rect x="765" y="260" width="55" height="22" rx="6" fill="#0C4A6E" stroke="#0284C7" stroke-width="1"/>
    <text x="792" y="275" fill="#BAE6FD" font-size="10" font-weight="800" text-anchor="middle">EDGE</text>

    <!-- Nodes -->
    ${node(860, 220, 'A', 'url(#rootGrad)', '#DDD6FE')}
    ${node(720, 340, 'B', 'url(#parentGrad)', '#BFDBFE')}
    ${node(1000, 340, 'C', 'url(#leafGrad)', '#A7F3D0')}
    ${node(640, 470, 'D', 'url(#leafGrad)', '#A7F3D0')}
    ${node(800, 470, 'E', 'url(#leafGrad)', '#A7F3D0')}

    <!-- Clear Callouts -->
    ${callout(860, 160, 'ROOT (Top Node A)', '#3B0764', '#A855F7', '#F5D0FE', { x: 860, y: 190 })}
    ${callout(620, 340, 'PARENT [B]', '#1E3A8A', '#3B82F6', '#DBEAFE', { x: 690, y: 340 })}
    ${callout(1100, 340, 'LEAF [C]', '#064E3B', '#10B981', '#D1FAE5', { x: 1030, y: 340 })}
    ${callout(720, 535, 'SIBLINGS: D and E (Share Parent B)', '#064E3B', '#10B981', '#D1FAE5', { x: 720, y: 500 })}
  </g>
`, 'Tree Terminology', 'Node, Root, Edge, Parent, Child, and Siblings', '"Let\'s learn tree terms. Each element is a node. The top node is the root. Connecting lines are edges. B is parent of D and E. D and E are siblings."');

fs.writeFileSync(path.join(OUT_DIR, 'scene03.svg'), s3);

// =========================================================================
// SCENE 04: Advanced Terminology — Leaf, Degree, Level, Height, Subtree (16.5s - 31.0s)
// =========================================================================
const s4 = svgWrapper(`
  <g>
    <!-- Left Column: Metrics Legend -->
    <rect x="60" y="140" width="380" height="440" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="180" fill="#FFFFFF" font-size="20" font-weight="800">Metrics &amp; Structure</text>

    <g transform="translate(85, 205)">
      <rect width="330" height="60" rx="10" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
      <text x="20" y="26" fill="#A7F3D0" font-size="13" font-weight="800">LEAF NODE</text>
      <text x="20" y="46" fill="#ECFDF5" font-size="12">A node with NO children (Degree = 0)</text>
    </g>

    <g transform="translate(85, 275)">
      <rect width="330" height="60" rx="10" fill="#1E1B4B" stroke="#6366F1" stroke-width="1.5"/>
      <text x="20" y="26" fill="#C7D2FE" font-size="13" font-weight="800">DEGREE</text>
      <text x="20" y="46" fill="#EEF2FF" font-size="12">Number of children of a node (B has 2)</text>
    </g>

    <g transform="translate(85, 345)">
      <rect width="330" height="60" rx="10" fill="#3B0764" stroke="#A855F7" stroke-width="1.5"/>
      <text x="20" y="26" fill="#F0ABFC" font-size="13" font-weight="800">DEPTH &amp; HEIGHT</text>
      <text x="20" y="46" fill="#FAF5FF" font-size="12">Depth of D = 2 edges | Tree Height = 2</text>
    </g>

    <g transform="translate(85, 415)">
      <rect width="330" height="60" rx="10" fill="#0C4A6E" stroke="#0284C7" stroke-width="1.5"/>
      <text x="20" y="26" fill="#BAE6FD" font-size="13" font-weight="800">SUBTREE</text>
      <text x="20" y="46" fill="#F0F9FF" font-size="12">A node &amp; all its descendants (Subtree B)</text>
    </g>

    <!-- Right Column: Diagram with Level Guidelines & Highlights -->
    <rect x="480" y="140" width="740" height="440" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

    <!-- Level Guidelines on the right -->
    <line x1="500" y1="220" x2="1140" y2="220" stroke="#334155" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="1150" y="225" fill="#94A3B8" font-size="11" font-weight="700">LEVEL 0</text>

    <line x1="500" y1="340" x2="1140" y2="340" stroke="#334155" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="1150" y="345" fill="#94A3B8" font-size="11" font-weight="700">LEVEL 1</text>

    <line x1="500" y1="470" x2="1140" y2="470" stroke="#334155" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="1150" y="475" fill="#94A3B8" font-size="11" font-weight="700">LEVEL 2</text>

    <!-- Subtree Boundary Box (Dotted Outline around B, D, E) -->
    <rect x="560" y="295" width="280" height="230" rx="16" fill="#6366F1" fill-opacity="0.08" stroke="#818CF8" stroke-width="1.5" stroke-dasharray="5,5"/>
    <text x="700" y="315" fill="#C7D2FE" font-size="11" font-weight="800" text-anchor="middle">SUBTREE OF B</text>

    <!-- Edges -->
    ${edge(820, 220, 680, 340, '#818CF8', 3)}
    ${edge(820, 220, 960, 340, '#818CF8', 3)}
    ${edge(680, 340, 600, 470, '#10B981', 3.5)}
    ${edge(680, 340, 760, 470, '#10B981', 3.5)}

    <!-- Nodes -->
    ${node(820, 220, 'A', 'url(#rootGrad)', '#DDD6FE')}
    ${node(680, 340, 'B', 'url(#parentGrad)', '#BFDBFE')}
    ${node(960, 340, 'C', 'url(#leafGrad)', '#A7F3D0')}
    ${node(600, 470, 'D', 'url(#leafGrad)', '#A7F3D0')}
    ${node(760, 470, 'E', 'url(#leafGrad)', '#A7F3D0')}

    <!-- Clear, non-overlapping Badges -->
    ${callout(820, 165, 'Root (Depth = 0)', '#3B0764', '#A855F7', '#F5D0FE')}
    ${callout(570, 340, 'DEGREE = 2', '#1E3A8A', '#3B82F6', '#DBEAFE', { x: 650, y: 340 })}
    ${callout(960, 290, 'LEAF (0 Children)', '#064E3B', '#10B981', '#D1FAE5', { x: 960, y: 310 })}
    ${callout(680, 540, 'LEAVES: D &amp; E (Level 2 | Depth = 2)', '#064E3B', '#10B981', '#D1FAE5')}
  </g>
`, 'Terminology Mastery', 'Leaf, Degree, Level, Depth, Height, and Subtrees', '"A node with no children is a leaf. A node\'s degree is its number of children. A node and its descendants form a subtree."');

fs.writeFileSync(path.join(OUT_DIR, 'scene04.svg'), s4);

// =========================================================================
// SCENE 05: Types of Trees — General Tree, Binary Tree, BST (31.0s - 44.5s)
// =========================================================================
const s5 = svgWrapper(`
  <g>
    <!-- Card 1: GENERAL TREE -->
    <rect x="60" y="140" width="360" height="440" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <rect x="85" y="165" width="130" height="26" rx="6" fill="#1E3A8A" stroke="#2563EB" stroke-width="1"/>
    <text x="150" y="182" fill="#93C5FD" font-size="11" font-weight="800" text-anchor="middle">TYPE 01</text>
    <text x="85" y="220" fill="#FFFFFF" font-size="18" font-weight="800">General Tree</text>
    <text x="85" y="245" fill="#94A3B8" font-size="13">Nodes have any number of children</text>

    <!-- Mini General Tree Diagram -->
    ${edge(240, 290, 140, 380, '#64748B', 2.5)}
    ${edge(240, 290, 240, 380, '#64748B', 2.5)}
    ${edge(240, 290, 340, 380, '#64748B', 2.5)}
    ${node(240, 290, 'A', 'url(#rootGrad)', '#DDD6FE')}
    ${node(140, 380, 'B', 'url(#parentGrad)', '#BFDBFE')}
    ${node(240, 380, 'C', 'url(#parentGrad)', '#BFDBFE')}
    ${node(340, 380, 'D', 'url(#parentGrad)', '#BFDBFE')}

    <rect x="85" y="450" width="310" height="60" rx="10" fill="#0B132B" stroke="#1E293B" stroke-width="1"/>
    <text x="105" y="475" fill="#38BDF8" font-size="13" font-weight="700">Arbitrary Branching</text>
    <text x="105" y="495" fill="#94A3B8" font-size="12">Root A has 3 children (B, C, D)</text>

    <!-- Card 2: BINARY TREE -->
    <rect x="460" y="140" width="360" height="440" rx="16" fill="url(#cardGrad)" stroke="#6366F1" stroke-width="2"/>
    <rect x="485" y="165" width="130" height="26" rx="6" fill="#312E81" stroke="#6366F1" stroke-width="1"/>
    <text x="550" y="182" fill="#C7D2FE" font-size="11" font-weight="800" text-anchor="middle">TYPE 02</text>
    <text x="485" y="220" fill="#FFFFFF" font-size="18" font-weight="800">Binary Tree</text>
    <text x="485" y="245" fill="#94A3B8" font-size="13">Every node has at most 2 children</text>

    <!-- Mini Binary Tree Diagram -->
    ${edge(640, 290, 560, 380, '#818CF8', 3)}
    ${edge(640, 290, 720, 380, '#818CF8', 3)}
    ${node(640, 290, 'A', 'url(#rootGrad)', '#DDD6FE')}
    ${node(560, 380, 'B', 'url(#parentGrad)', '#BFDBFE')}
    ${node(720, 380, 'C', 'url(#parentGrad)', '#BFDBFE')}

    <rect x="485" y="450" width="310" height="60" rx="10" fill="#1E1B4B" stroke="#4338CA" stroke-width="1"/>
    <text x="505" y="475" fill="#A5B4FC" font-size="13" font-weight="700">Left &amp; Right Pointers</text>
    <text x="505" y="495" fill="#94A3B8" font-size="12">Strict limit: 0, 1, or 2 children</text>

    <!-- Card 3: BINARY SEARCH TREE (BST) -->
    <rect x="860" y="140" width="360" height="440" rx="16" fill="url(#cardGrad)" stroke="#10B981" stroke-width="2"/>
    <rect x="885" y="165" width="130" height="26" rx="6" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
    <text x="950" y="182" fill="#A7F3D0" font-size="11" font-weight="800" text-anchor="middle">TYPE 03</text>
    <text x="885" y="220" fill="#FFFFFF" font-size="18" font-weight="800">Binary Search Tree (BST)</text>
    <text x="885" y="245" fill="#94A3B8" font-size="13">Ordered values: Left &lt; Parent &lt; Right</text>

    <!-- Mini BST Diagram -->
    ${edge(1040, 290, 960, 380, '#34D399', 3)}
    ${edge(1040, 290, 1120, 380, '#34D399', 3)}
    ${node(1040, 290, '50', 'url(#rootGrad)', '#DDD6FE')}
    ${node(960, 380, '30', 'url(#parentGrad)', '#BFDBFE')}
    ${node(1120, 380, '70', 'url(#leafGrad)', '#A7F3D0')}

    <!-- Clear Comparison Badges -->
    <rect x="885" y="430" width="140" height="30" rx="8" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1"/>
    <text x="955" y="450" fill="#BFDBFE" font-size="12" font-weight="800" text-anchor="middle">30 &lt; 50 (LEFT)</text>

    <rect x="1055" y="430" width="140" height="30" rx="8" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
    <text x="1125" y="450" fill="#A7F3D0" font-size="12" font-weight="800" text-anchor="middle">70 &gt; 50 (RIGHT)</text>

    <rect x="885" y="480" width="310" height="50" rx="10" fill="#064E3B" fill-opacity="0.5" stroke="#10B981" stroke-width="1"/>
    <text x="1040" y="510" fill="#D1FAE5" font-size="13" font-weight="700" text-anchor="middle">Invariant: Left &lt; Root &lt; Right</text>
  </g>
`, 'Core Tree Categories', 'General Tree, Binary Tree, and Binary Search Tree (BST)', '"There are 3 basic types of trees. A general tree can have any number of children. A binary tree has at most 2 children. In a BST, smaller values go left, greater go right."');

fs.writeFileSync(path.join(OUT_DIR, 'scene05.svg'), s5);

// =========================================================================
// SCENE 06: Types of Binary Trees — Strictly Binary & Full (44.5s - 56.0s)
// =========================================================================
const s6 = svgWrapper(`
  <g>
    <!-- Left Card: STRICTLY BINARY TREE -->
    <rect x="60" y="140" width="560" height="440" rx="16" fill="url(#cardGrad)" stroke="#8B5CF6" stroke-width="2"/>
    <rect x="85" y="165" width="200" height="28" rx="8" fill="#3B0764" stroke="#A855F7" stroke-width="1.5"/>
    <text x="185" y="184" fill="#F0ABFC" font-size="12" font-weight="800" text-anchor="middle">TYPE 1 • STRICTLY BINARY</text>

    <text x="85" y="225" fill="#FFFFFF" font-size="20" font-weight="800">Strictly Binary Tree</text>
    <text x="85" y="250" fill="#A5B4FC" font-size="14" font-weight="600">Every node has EXACTLY 0 or 2 children</text>
    <text x="85" y="272" fill="#94A3B8" font-size="13">No node in the tree is allowed to have only 1 child.</text>

    <!-- Tree Diagram -->
    ${edge(340, 320, 240, 410, '#818CF8', 3)}
    ${edge(340, 320, 440, 410, '#818CF8', 3)}
    ${edge(240, 410, 180, 500, '#818CF8', 3)}
    ${edge(240, 410, 300, 500, '#818CF8', 3)}

    ${node(340, 320, '10', 'url(#rootGrad)', '#DDD6FE')}
    ${node(240, 410, '5', 'url(#parentGrad)', '#BFDBFE')}
    ${node(440, 410, '15', 'url(#leafGrad)', '#A7F3D0')}
    ${node(180, 500, '2', 'url(#leafGrad)', '#A7F3D0')}
    ${node(300, 500, '7', 'url(#leafGrad)', '#A7F3D0')}

    ${callout(440, 460, '0 Children (Leaf)', '#064E3B', '#10B981', '#D1FAE5')}
    ${callout(240, 545, '2 Children (2 &amp; 7)', '#1E3A8A', '#3B82F6', '#DBEAFE')}

    <!-- Right Card: FULL BINARY TREE -->
    <rect x="660" y="140" width="560" height="440" rx="16" fill="url(#cardGrad)" stroke="#3B82F6" stroke-width="2"/>
    <rect x="685" y="165" width="200" height="28" rx="8" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1.5"/>
    <text x="785" y="184" fill="#BFDBFE" font-size="12" font-weight="800" text-anchor="middle">TYPE 2 • FULL BINARY TREE</text>

    <text x="685" y="225" fill="#FFFFFF" font-size="20" font-weight="800">Full Binary Tree</text>
    <text x="685" y="250" fill="#93C5FD" font-size="14" font-weight="600">All internal nodes have 2 children</text>
    <text x="685" y="272" fill="#94A3B8" font-size="13">Leaves are at the lowest level; symmetric balance.</text>

    <!-- Tree Diagram -->
    ${edge(940, 320, 840, 410, '#60A5FA', 3)}
    ${edge(940, 320, 1040, 410, '#60A5FA', 3)}
    ${edge(840, 410, 780, 500, '#60A5FA', 3)}
    ${edge(840, 410, 900, 500, '#60A5FA', 3)}
    ${edge(1040, 410, 980, 500, '#60A5FA', 3)}
    ${edge(1040, 410, 1100, 500, '#60A5FA', 3)}

    ${node(940, 320, '40', 'url(#rootGrad)', '#DDD6FE')}
    ${node(840, 410, '20', 'url(#parentGrad)', '#BFDBFE')}
    ${node(1040, 410, '60', 'url(#parentGrad)', '#BFDBFE')}
    ${node(780, 500, '10', 'url(#leafGrad)', '#A7F3D0')}
    ${node(900, 500, '30', 'url(#leafGrad)', '#A7F3D0')}
    ${node(980, 500, '50', 'url(#leafGrad)', '#A7F3D0')}
    ${node(1100, 500, '70', 'url(#leafGrad)', '#A7F3D0')}

    ${callout(940, 545, 'All leaves (10, 30, 50, 70) at identical level', '#1E293B', '#60A5FA', '#E0F2FE')}
  </g>
`, 'Binary Tree Variations', 'Strictly Binary (0 or 2 children) and Full Binary Tree', '"A strictly binary tree has either 0 or 2 children. Full binary tree: all internal nodes have two children."');

fs.writeFileSync(path.join(OUT_DIR, 'scene06.svg'), s6);

// =========================================================================
// SCENE 07: Complete & Perfect Binary Trees (56.0s - 65.0s)
// =========================================================================
const s7 = svgWrapper(`
  <g>
    <!-- Left Card: COMPLETE BINARY TREE -->
    <rect x="60" y="140" width="560" height="440" rx="16" fill="url(#cardGrad)" stroke="#10B981" stroke-width="2"/>
    <rect x="85" y="165" width="220" height="28" rx="8" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
    <text x="195" y="184" fill="#A7F3D0" font-size="12" font-weight="800" text-anchor="middle">TYPE 3 • COMPLETE BINARY</text>

    <text x="85" y="225" fill="#FFFFFF" font-size="20" font-weight="800">Complete Binary Tree</text>
    <text x="85" y="250" fill="#34D399" font-size="14" font-weight="600">All levels filled; last level filled Left-to-Right</text>
    <text x="85" y="272" fill="#94A3B8" font-size="13">Essential for Binary Heaps and Priority Queues.</text>

    <!-- Diagram -->
    ${edge(340, 320, 240, 410, '#34D399', 3)}
    ${edge(340, 320, 440, 410, '#34D399', 3)}
    ${edge(240, 410, 180, 500, '#34D399', 3)}
    ${edge(240, 410, 300, 500, '#34D399', 3)}
    ${edge(440, 410, 380, 500, '#34D399', 3)}

    ${node(340, 320, '25', 'url(#rootGrad)', '#DDD6FE')}
    ${node(240, 410, '15', 'url(#parentGrad)', '#BFDBFE')}
    ${node(440, 410, '35', 'url(#parentGrad)', '#BFDBFE')}
    ${node(180, 500, '10', 'url(#leafGrad)', '#A7F3D0')}
    ${node(300, 500, '20', 'url(#leafGrad)', '#A7F3D0')}
    ${node(380, 500, '30', 'url(#leafGrad)', '#A7F3D0')}

    ${callout(280, 545, 'Filled Left-to-Right without gaps', '#064E3B', '#10B981', '#D1FAE5')}

    <!-- Right Card: PERFECT BINARY TREE -->
    <rect x="660" y="140" width="560" height="440" rx="16" fill="url(#cardGrad)" stroke="#F59E0B" stroke-width="2"/>
    <rect x="685" y="165" width="220" height="28" rx="8" fill="#451A03" stroke="#F59E0B" stroke-width="1.5"/>
    <text x="795" y="184" fill="#FDE68A" font-size="12" font-weight="800" text-anchor="middle">TYPE 4 • PERFECT BINARY</text>

    <text x="685" y="225" fill="#FFFFFF" font-size="20" font-weight="800">Perfect Binary Tree</text>
    <text x="685" y="250" fill="#FBBF24" font-size="14" font-weight="600">Every internal node has 2 children</text>
    <text x="685" y="272" fill="#94A3B8" font-size="13">All leaves are at the exact same lowest level.</text>

    <!-- Diagram -->
    ${edge(940, 320, 840, 410, '#FBBF24', 3)}
    ${edge(940, 320, 1040, 410, '#FBBF24', 3)}
    ${edge(840, 410, 780, 500, '#FBBF24', 3)}
    ${edge(840, 410, 900, 500, '#FBBF24', 3)}
    ${edge(1040, 410, 980, 500, '#FBBF24', 3)}
    ${edge(1040, 410, 1100, 500, '#FBBF24', 3)}

    ${node(940, 320, 'A', 'url(#rootGrad)', '#DDD6FE')}
    ${node(840, 410, 'B', 'url(#parentGrad)', '#BFDBFE')}
    ${node(1040, 410, 'C', 'url(#parentGrad)', '#BFDBFE')}
    ${node(780, 500, 'D', 'url(#leafGrad)', '#A7F3D0')}
    ${node(900, 500, 'E', 'url(#leafGrad)', '#A7F3D0')}
    ${node(980, 500, 'F', 'url(#leafGrad)', '#A7F3D0')}
    ${node(1100, 500, 'G', 'url(#leafGrad)', '#A7F3D0')}

    ${callout(940, 545, 'Maximum Nodes: 2^(h+1) - 1 = 7 nodes', '#78350F', '#F59E0B', '#FEF3C7')}
  </g>
`, 'Complete vs Perfect', 'Complete (sequential left fill) and Perfect (completely full)', '"Next, complete binary tree: last level filled left to right. A perfect binary tree has 2 children at every internal node, all leaves at the same level."');

fs.writeFileSync(path.join(OUT_DIR, 'scene07.svg'), s7);

// =========================================================================
// SCENE 08: Degenerate Tree & Grand Summary (65.0s - 75.36s)
// =========================================================================
const s8 = svgWrapper(`
  <g>
    <!-- Left Card: DEGENERATE (SKEWED) TREE -->
    <rect x="60" y="140" width="500" height="440" rx="16" fill="url(#cardGrad)" stroke="#EF4444" stroke-width="2"/>
    <rect x="85" y="165" width="220" height="28" rx="8" fill="#450A0A" stroke="#EF4444" stroke-width="1.5"/>
    <text x="195" y="184" fill="#FCA5A5" font-size="12" font-weight="800" text-anchor="middle">TYPE 5 • DEGENERATE TREE</text>

    <text x="85" y="225" fill="#FFFFFF" font-size="20" font-weight="800">Degenerate (Skewed) Tree</text>
    <text x="85" y="250" fill="#F87171" font-size="14" font-weight="600">Every node has ONLY ONE child</text>
    <text x="85" y="272" fill="#94A3B8" font-size="13">Degrades into a Linear Linked List; O(N) search.</text>

    <!-- Linear Chain Diagram -->
    ${edge(160, 310, 220, 360, '#F87171', 3)}
    ${edge(220, 360, 280, 410, '#F87171', 3)}
    ${edge(280, 410, 340, 460, '#F87171', 3)}
    ${edge(340, 460, 400, 510, '#F87171', 3)}

    ${node(160, 310, 'A', 'url(#rootGrad)', '#DDD6FE')}
    ${node(220, 360, 'B', 'url(#parentGrad)', '#BFDBFE')}
    ${node(280, 410, 'C', 'url(#parentGrad)', '#BFDBFE')}
    ${node(340, 460, 'D', 'url(#parentGrad)', '#BFDBFE')}
    ${node(400, 510, 'E', 'url(#leafGrad)', '#A7F3D0')}

    ${callout(280, 545, 'Single path: Linear performance O(N)', '#450A0A', '#EF4444', '#FEE2E2')}

    <!-- Right Card: COMPLETE TAXONOMY SUMMARY -->
    <rect x="600" y="140" width="620" height="440" rx="16" fill="url(#cardGrad)" stroke="#6366F1" stroke-width="2"/>
    <text x="630" y="180" fill="#FFFFFF" font-size="22" font-weight="800">Summary: 5 Binary Tree Types</text>

    <g transform="translate(630, 205)">
      <rect width="560" height="55" rx="10" fill="#1E1B4B" stroke="#6366F1" stroke-width="1"/>
      <text x="25" y="32" fill="#A5B4FC" font-size="14" font-weight="800">1. Strictly Binary</text>
      <text x="200" y="32" fill="#E0E7FF" font-size="13">Every node has either 0 or 2 children</text>
    </g>

    <g transform="translate(630, 270)">
      <rect width="560" height="55" rx="10" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1"/>
      <text x="25" y="32" fill="#93C5FD" font-size="14" font-weight="800">2. Full Binary</text>
      <text x="200" y="32" fill="#E0F2FE" font-size="13">All internal nodes have 2 children; all leaves level</text>
    </g>

    <g transform="translate(630, 335)">
      <rect width="560" height="55" rx="10" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
      <text x="25" y="32" fill="#6EE7B7" font-size="14" font-weight="800">3. Complete Binary</text>
      <text x="200" y="32" fill="#ECFDF5" font-size="13">All levels full except last; filled left to right</text>
    </g>

    <g transform="translate(630, 400)">
      <rect width="560" height="55" rx="10" fill="#451A03" stroke="#F59E0B" stroke-width="1"/>
      <text x="25" y="32" fill="#FDE68A" font-size="14" font-weight="800">4. Perfect Binary</text>
      <text x="200" y="32" fill="#FFFBEB" font-size="13">Completely filled triangle; 2^(h+1) - 1 nodes</text>
    </g>

    <g transform="translate(630, 465)">
      <rect width="560" height="55" rx="10" fill="#450A0A" stroke="#EF4444" stroke-width="1"/>
      <text x="25" y="32" fill="#FCA5A5" font-size="14" font-weight="800">5. Degenerate</text>
      <text x="200" y="32" fill="#FEF2F2" font-size="13">Every parent has exactly 1 child; linear list</text>
    </g>

    <!-- Success Badge -->
    <rect x="630" y="530" width="560" height="40" rx="10" fill="#0F172A" stroke="#334155" stroke-width="1"/>
    <text x="910" y="555" fill="#38BDF8" font-size="13" font-weight="700" text-anchor="middle">✓ Tree DSA Visual Masterclass Completed</text>
  </g>
`, 'Degenerate Tree & Summary', '5 Types of Binary Trees Explained with Zero Text Overlaps', '"Degenerate binary tree: one child per node. These are the main types of binary trees."');

fs.writeFileSync(path.join(OUT_DIR, 'scene08.svg'), s8);

console.log('All 8 SVG master scenes created successfully!');
