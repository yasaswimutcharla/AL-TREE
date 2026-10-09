import os
import subprocess
import xml.etree.ElementTree as ET

SCENES_DIR = "/tmp/animated_scenes"
os.makedirs(SCENES_DIR, exist_ok=True)

def escape_xml(s):
    return (s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace('"', "&quot;")
             .replace("'", "&apos;"))

def make_svg(content, title, subtitle, narration, active_step, total_steps=27, part_tag="LIVE WORKING EXPLANATION"):
    t_title = escape_xml(title)
    t_sub = escape_xml(subtitle)
    t_narr = escape_xml(narration)
    t_part = escape_xml(part_tag)
    progress_pct = int((active_step / total_steps) * 100)
    progress_w = int((active_step / total_steps) * 1200)
    
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720" style="background:#070B16; font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,sans-serif;">
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
    <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.95"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bgGrad)"/>

  <!-- Subtle Animated Grid Pattern -->
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

  <!-- Ambient Glow -->
  <circle cx="260" cy="200" r="180" fill="#4F46E5" opacity="0.09" filter="url(#glow)"/>
  <circle cx="1060" cy="380" r="220" fill="#7C3AED" opacity="0.09" filter="url(#glow)"/>

  <!-- TOP HEADER BAR -->
  <rect x="0" y="0" width="1280" height="85" fill="#060913" fill-opacity="0.96"/>
  <line x1="0" y1="85" x2="1280" y2="85" stroke="#1E293B" stroke-width="1.5"/>

  <!-- Brand -->
  <rect x="40" y="24" width="135" height="36" rx="8" fill="#1E1B4B" stroke="#4338CA" stroke-width="1.5"/>
  <text x="107" y="47" fill="#A5B4FC" font-size="13" font-weight="800" letter-spacing="1.5" text-anchor="middle">ALGOLEARN</text>

  <!-- Working Tag -->
  <rect x="185" y="24" width="220" height="36" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
  <circle cx="205" cy="42" r="4" fill="#38BDF8"/>
  <text x="300" y="47" fill="#38BDF8" font-size="12" font-weight="700" letter-spacing="1" text-anchor="middle">{t_part}</text>

  <!-- Main Title -->
  <text x="425" y="44" fill="#FFFFFF" font-size="22" font-weight="800">{t_title}</text>
  <text x="425" y="66" fill="#94A3B8" font-size="13" font-weight="500">{t_sub}</text>

  <!-- Live Pulse Badge Right -->
  <rect x="1100" y="24" width="140" height="36" rx="8" fill="#064E3B" fill-opacity="0.7" stroke="#10B981" stroke-width="1.5"/>
  <circle cx="1120" cy="42" r="5" fill="#34D399" filter="url(#glow)"/>
  <text x="1178" y="47" fill="#A7F3D0" font-size="12" font-weight="800" text-anchor="middle">WORKING DEMO</text>

  <!-- MAIN CANVAS (Y: 95 to 610) -->
  {content}

  <!-- BOTTOM NARRATION / PROGRESS BAR -->
  <rect x="40" y="625" width="1200" height="72" rx="16" fill="#0B0F19" fill-opacity="0.96" stroke="#334155" stroke-width="1.5"/>
  <rect x="52" y="637" width="34" height="48" rx="8" fill="#4F46E5" fill-opacity="0.3"/>
  <text x="69" y="666" fill="#818CF8" font-size="16" font-weight="bold" text-anchor="middle">🎙</text>

  <text x="102" y="652" fill="#94A3B8" font-size="11" font-weight="700" letter-spacing="1">AUDIO NARRATION &amp; LIVE TIMELINE</text>
  <text x="102" y="675" fill="#FFFFFF" font-size="15" font-weight="600">{t_narr}</text>

  <!-- Dynamic Progress Bar at bottom of card -->
  <rect x="40" y="692" width="1200" height="5" rx="2.5" fill="#1E293B"/>
  <rect x="40" y="692" width="{progress_w}" height="5" rx="2.5" fill="#8B5CF6"/>
</svg>"""

def edge(x1, y1, x2, y2, color="#64748B", width=3, dashed=False, animated_pulse=False):
    dash_attr = 'stroke-dasharray="6,6"' if dashed else ""
    glow_attr = 'filter="url(#glow)"' if animated_pulse else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}" stroke-linecap="round" {dash_attr} {glow_attr}/>'

def node(cx, cy, val, fill="url(#parentGrad)", stroke="#93C5FD", textColor="#FFFFFF", is_active=False):
    filter_val = "url(#activeGlow)" if is_active else "url(#glow)"
    stroke_w = "3.5" if is_active else "2.5"
    pulse_ring = f'<circle cx="{cx}" cy="{cy}" r="38" fill="none" stroke="{stroke}" stroke-width="2" opacity="0.4" stroke-dasharray="4,4"/>' if is_active else ""
    return f"""<g>
    {pulse_ring}
    <circle cx="{cx}" cy="{cy}" r="28" fill="{fill}" stroke="{stroke}" stroke-width="{stroke_w}" filter="{filter_val}"/>
    <text x="{cx}" y="{cy + 6}" fill="{textColor}" font-size="16" font-weight="800" text-anchor="middle" dominant-baseline="middle">{val}</text>
  </g>"""

def callout(x, y, text, bg="#1E1B4B", border="#6366F1", textColor="#C7D2FE", line_to=None):
    leader = ""
    if line_to:
        leader = f'<line x1="{x}" y1="{y}" x2="{line_to[0]}" y2="{line_to[1]}" stroke="{border}" stroke-width="1.5" stroke-dasharray="3,3"/>'
    w = len(text) * 8.5 + 24
    return f"""{leader}
  <g>
    <rect x="{x - w / 2}" y="{y - 15}" width="{w}" height="30" rx="8" fill="{bg}" stroke="{border}" stroke-width="1.5"/>
    <text x="{x}" y="{y + 5}" fill="{textColor}" font-size="12" font-weight="800" text-anchor="middle">{escape_xml(text)}</text>
  </g>"""

# =========================================================================
# BUILD 27 PROGRESSIVE WORKING STAGES
# =========================================================================
stages = []

# Stage 01 (0.0s - 2.0s): Root Node Appears
c = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="180" fill="#FFFFFF" font-size="22" font-weight="800">Tree Fundamentals</text>
    <text x="85" y="215" fill="#94A3B8" font-size="14">Trees are non-linear hierarchical data structures.</text>
    
    <g transform="translate(85, 250)">
      <rect width="330" height="70" rx="10" fill="#1E1B4B" stroke="#8B5CF6" stroke-width="1.5"/>
      <circle cx="25" cy="35" r="10" fill="#8B5CF6" filter="url(#glow)"/>
      <text x="45" y="30" fill="#DDD6FE" font-size="14" font-weight="800">ROOT NODE SPAWNING</text>
      <text x="45" y="52" fill="#94A3B8" font-size="12">Single top starting point of the entire tree</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    {node(850, 220, '10', 'url(#rootGrad)', '#DDD6FE', '#FFFFFF', is_active=True)}
    {callout(850, 160, 'ROOT NODE [10] (Depth 0)', '#3B0764', '#A855F7', '#F3E8FF', (850, 190))}
    <text x="850" y="320" fill="#A5B4FC" font-size="14" font-weight="700" text-anchor="middle">Hierarchical structure initiates at the Root...</text>
  </g>
"""
stages.append((c, "01. Introducing Tree Structure", "A tree begins from a single root node", "This is a simple tree.", 2.0))

# Stage 02 (2.0s - 4.6s): Branches sprout to 5 and 20
c = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="180" fill="#FFFFFF" font-size="22" font-weight="800">Root Node &amp; Children</text>
    <text x="85" y="215" fill="#94A3B8" font-size="14">Links branch downward to child elements.</text>

    <g transform="translate(85, 250)">
      <rect width="330" height="70" rx="10" fill="#0C4A6E" stroke="#0284C7" stroke-width="1.5"/>
      <circle cx="25" cy="35" r="10" fill="#0284C7"/>
      <text x="45" y="30" fill="#BAE6FD" font-size="14" font-weight="800">BRANCHING EDGES</text>
      <text x="45" y="52" fill="#94A3B8" font-size="12">Connecting lines between parent and child</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    {edge(850, 220, 710, 340, '#818CF8', 4, animated_pulse=True)}
    {edge(850, 220, 990, 340, '#818CF8', 4, animated_pulse=True)}
    {node(850, 220, '10', 'url(#rootGrad)', '#DDD6FE', '#FFFFFF', is_active=True)}
    {node(710, 340, '5', 'url(#parentGrad)', '#BFDBFE')}
    {node(990, 340, '20', 'url(#leafGrad)', '#A7F3D0')}
    {callout(850, 160, 'ROOT NODE [10]', '#3B0764', '#A855F7', '#F3E8FF', (850, 190))}
    {callout(710, 400, 'Left Child [5]', '#1E3A8A', '#3B82F6', '#DBEAFE')}
    {callout(990, 400, 'Right Child [20]', '#064E3B', '#10B981', '#D1FAE5')}
  </g>
"""
stages.append((c, "01. Root & First Level", "The top node is called the root", "The top node is called the root.", 2.6))

# Stage 03 (4.6s - 7.2s): Parent 5 branches to 2 and 7
c = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="180" fill="#FFFFFF" font-size="22" font-weight="800">Parent-Child Links</text>
    <text x="85" y="215" fill="#94A3B8" font-size="14">Node 5 serves as parent to children 2 and 7.</text>

    <g transform="translate(85, 250)">
      <rect width="330" height="70" rx="10" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1.5"/>
      <circle cx="25" cy="35" r="10" fill="#3B82F6" filter="url(#glow)"/>
      <text x="45" y="30" fill="#BFDBFE" font-size="14" font-weight="800">PARENT NODE [5]</text>
      <text x="45" y="52" fill="#94A3B8" font-size="12">Direct ancestor of nodes 2 and 7</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    {edge(850, 220, 710, 340, '#475569', 2.5)}
    {edge(850, 220, 990, 340, '#475569', 2.5)}
    {edge(710, 340, 630, 470, '#38BDF8', 4, animated_pulse=True)}
    {edge(710, 340, 790, 470, '#38BDF8', 4, animated_pulse=True)}

    {node(850, 220, '10', '#1E293B', '#475569', '#94A3B8')}
    {node(710, 340, '5', 'url(#parentGrad)', '#93C5FD', is_active=True)}
    {node(990, 340, '20', '#1E293B', '#475569', '#94A3B8')}
    {node(630, 470, '2', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(790, 470, '7', 'url(#leafGrad)', '#A7F3D0', is_active=True)}

    {callout(710, 280, 'PARENT NODE [5]', '#1E3A8A', '#3B82F6', '#DBEAFE', (710, 310))}
    {callout(630, 530, 'Child [2]', '#064E3B', '#10B981', '#D1FAE5')}
    {callout(790, 530, 'Child [7]', '#064E3B', '#10B981', '#D1FAE5')}
  </g>
"""
stages.append((c, "02. Parent & Child Nodes", "Node 5 has children 2 and 7", "5 is a parent of 2 and 7.", 2.6))

# Stage 04 (7.2s - 9.5s): Siblings relationship
c = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="180" fill="#FFFFFF" font-size="22" font-weight="800">Sibling Relationship</text>
    <text x="85" y="215" fill="#94A3B8" font-size="14">Nodes with the same immediate parent are siblings.</text>

    <g transform="translate(85, 250)">
      <rect width="330" height="70" rx="10" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
      <circle cx="25" cy="35" r="10" fill="#10B981" filter="url(#glow)"/>
      <text x="45" y="30" fill="#A7F3D0" font-size="14" font-weight="800">SIBLINGS: [2] &amp; [7]</text>
      <text x="45" y="52" fill="#94A3B8" font-size="12">Share the exact same parent node 5</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    {edge(850, 220, 710, 340, '#475569', 2.5)}
    {edge(850, 220, 990, 340, '#475569', 2.5)}
    {edge(710, 340, 630, 470, '#38BDF8', 3.5)}
    {edge(710, 340, 790, 470, '#38BDF8', 3.5)}

    <!-- Sibling Connector Arc -->
    <path d="M 630 495 Q 710 535 790 495" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="5,5"/>

    {node(850, 220, '10', 'url(#rootGrad)', '#DDD6FE')}
    {node(710, 340, '5', 'url(#parentGrad)', '#BFDBFE')}
    {node(990, 340, '20', 'url(#leafGrad)', '#A7F3D0')}
    {node(630, 470, '2', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(790, 470, '7', 'url(#leafGrad)', '#A7F3D0', is_active=True)}

    {callout(710, 545, 'SIBLINGS: 2 &amp; 7 share parent 5', '#451A03', '#F59E0B', '#FEF3C7')}
  </g>
"""
stages.append((c, "02. Sibling Relationship", "Nodes 2 and 7 share parent 5", "5 is a parent of 2 and 7. Nodes 2 and 7 are siblings.", 2.3))

# Stage 05 (9.5s - 13.5s): Tree Terminology Board - Nodes
c = f"""
  <g>
    <rect x="60" y="130" width="400" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="170" fill="#FFFFFF" font-size="20" font-weight="800">Tree Terminology</text>

    <g transform="translate(85, 195)">
      <rect width="350" height="65" rx="10" fill="#1E1B4B" stroke="#6366F1" stroke-width="2"/>
      <circle cx="25" cy="32" r="14" fill="#8B5CF6" filter="url(#glow)"/>
      <text x="50" y="27" fill="#C7D2FE" font-size="14" font-weight="800">NODE</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Each element: A, B, C, D, E</text>
    </g>

    <g transform="translate(85, 270)">
      <rect width="350" height="65" rx="10" fill="#0F172A" stroke="#334155" stroke-width="1"/>
      <text x="25" y="37" fill="#64748B" font-size="14" font-weight="800">ROOT</text>
      <text x="80" y="37" fill="#94A3B8" font-size="12">The top node with no parent</text>
    </g>

    <g transform="translate(85, 345)">
      <rect width="350" height="65" rx="10" fill="#0F172A" stroke="#334155" stroke-width="1"/>
      <text x="25" y="37" fill="#64748B" font-size="14" font-weight="800">EDGE</text>
      <text x="80" y="37" fill="#94A3B8" font-size="12">Connecting line between nodes</text>
    </g>
  </g>

  <g>
    <rect x="500" y="130" width="720" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    {edge(860, 220, 720, 340, '#818CF8', 3)}
    {edge(860, 220, 1000, 340, '#818CF8', 3)}
    {edge(720, 340, 640, 470, '#818CF8', 3)}
    {edge(720, 340, 800, 470, '#818CF8', 3)}

    {node(860, 220, 'A', 'url(#rootGrad)', '#DDD6FE', is_active=True)}
    {node(720, 340, 'B', 'url(#parentGrad)', '#BFDBFE', is_active=True)}
    {node(1000, 340, 'C', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(640, 470, 'D', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(800, 470, 'E', 'url(#leafGrad)', '#A7F3D0', is_active=True)}

    {callout(860, 160, 'Every circle is a Node', '#1E1B4B', '#6366F1', '#C7D2FE')}
  </g>
"""
stages.append((c, "03. Tree Terminology", "Each element in a tree is called a node", "Let's learn tree terms. Each element is a node.", 4.0))

# Stage 06 (13.5s - 16.5s): Root & Edges Highlight
c = f"""
  <g>
    <rect x="60" y="130" width="400" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="170" fill="#FFFFFF" font-size="20" font-weight="800">Root &amp; Edges</text>

    <g transform="translate(85, 195)">
      <rect width="350" height="65" rx="10" fill="#3B0764" stroke="#A855F7" stroke-width="2"/>
      <circle cx="25" cy="32" r="14" fill="#7C3AED" filter="url(#glow)"/>
      <text x="50" y="27" fill="#F0ABFC" font-size="14" font-weight="800">ROOT: NODE A</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Topmost node (Zero parents)</text>
    </g>

    <g transform="translate(85, 270)">
      <rect width="350" height="65" rx="10" fill="#0C4A6E" stroke="#0284C7" stroke-width="2"/>
      <circle cx="25" cy="32" r="14" fill="#0284C7" filter="url(#glow)"/>
      <text x="50" y="27" fill="#7DD3FC" font-size="14" font-weight="800">EDGES (4 Total)</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Lines connecting nodes: N-1 rule (5-1=4)</text>
    </g>
  </g>

  <g>
    <rect x="500" y="130" width="720" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    {edge(860, 220, 720, 340, '#38BDF8', 4.5, animated_pulse=True)}
    {edge(860, 220, 1000, 340, '#38BDF8', 4.5, animated_pulse=True)}
    {edge(720, 340, 640, 470, '#38BDF8', 4.5, animated_pulse=True)}
    {edge(720, 340, 800, 470, '#38BDF8', 4.5, animated_pulse=True)}

    <rect x="765" y="260" width="60" height="24" rx="6" fill="#0C4A6E" stroke="#0284C7" stroke-width="1.5"/>
    <text x="795" y="276" fill="#BAE6FD" font-size="11" font-weight="800" text-anchor="middle">EDGE</text>

    {node(860, 220, 'A', 'url(#rootGrad)', '#DDD6FE', is_active=True)}
    {node(720, 340, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(1000, 340, 'C', 'url(#leafGrad)', '#A7F3D0')}
    {node(640, 470, 'D', 'url(#leafGrad)', '#A7F3D0')}
    {node(800, 470, 'E', 'url(#leafGrad)', '#A7F3D0')}

    {callout(860, 160, 'ROOT NODE A', '#3B0764', '#A855F7', '#F5D0FE', (860, 190))}
  </g>
"""
stages.append((c, "03. Root & Connecting Edges", "The top node is the root; connecting lines are edges", "The top node is the root. Connecting lines are edges.", 3.0))

# Stage 07 (16.5s - 20.0s): Parent B and Siblings D & E
c = f"""
  <g>
    <rect x="60" y="130" width="400" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="170" fill="#FFFFFF" font-size="20" font-weight="800">Parents &amp; Siblings</text>

    <g transform="translate(85, 195)">
      <rect width="350" height="65" rx="10" fill="#1E3A8A" stroke="#3B82F6" stroke-width="2"/>
      <circle cx="25" cy="32" r="14" fill="#3B82F6"/>
      <text x="50" y="27" fill="#BFDBFE" font-size="14" font-weight="800">B IS PARENT OF D &amp; E</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Direct ancestor of children D and E</text>
    </g>

    <g transform="translate(85, 270)">
      <rect width="350" height="65" rx="10" fill="#064E3B" stroke="#10B981" stroke-width="2"/>
      <circle cx="25" cy="32" r="14" fill="#10B981" filter="url(#glow)"/>
      <text x="50" y="27" fill="#A7F3D0" font-size="14" font-weight="800">SIBLINGS: D &amp; E</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Same parent node B</text>
    </g>
  </g>

  <g>
    <rect x="500" y="130" width="720" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    {edge(860, 220, 720, 340, '#475569', 2.5)}
    {edge(860, 220, 1000, 340, '#475569', 2.5)}
    {edge(720, 340, 640, 470, '#38BDF8', 4)}
    {edge(720, 340, 800, 470, '#38BDF8', 4)}

    <path d="M 640 495 Q 720 535 800 495" fill="none" stroke="#F59E0B" stroke-width="2.5" stroke-dasharray="4,4"/>

    {node(860, 220, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(720, 340, 'B', 'url(#parentGrad)', '#BFDBFE', is_active=True)}
    {node(1000, 340, 'C', 'url(#leafGrad)', '#A7F3D0')}
    {node(640, 470, 'D', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(800, 470, 'E', 'url(#leafGrad)', '#A7F3D0', is_active=True)}

    {callout(720, 280, 'PARENT [B]', '#1E3A8A', '#3B82F6', '#DBEAFE', (720, 310))}
    {callout(720, 545, 'SIBLINGS: D &amp; E', '#451A03', '#F59E0B', '#FEF3C7')}
  </g>
"""
stages.append((c, "03. Siblings & Hierarchy", "B is parent of D and E; D and E are siblings", "B is parent of D and E. D and E are siblings.", 3.5))

# Stage 08 (20.0s - 23.5s): Leaf Nodes Identified
c = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="170" fill="#FFFFFF" font-size="20" font-weight="800">Leaf Nodes</text>

    <g transform="translate(85, 200)">
      <rect width="330" height="85" rx="10" fill="#064E3B" stroke="#10B981" stroke-width="2"/>
      <circle cx="25" cy="30" r="10" fill="#10B981" filter="url(#glow)"/>
      <text x="45" y="28" fill="#A7F3D0" font-size="14" font-weight="800">LEAF NODES (Degree = 0)</text>
      <text x="45" y="52" fill="#ECFDF5" font-size="13">Nodes with NO children.</text>
      <text x="45" y="72" fill="#D1FAE5" font-size="12">In this tree: Nodes C, D, and E</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    {edge(820, 220, 680, 340, '#475569', 2.5)}
    {edge(820, 220, 960, 340, '#10B981', 3.5)}
    {edge(680, 340, 600, 470, '#10B981', 3.5)}
    {edge(680, 340, 760, 470, '#10B981', 3.5)}

    {node(820, 220, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(680, 340, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(960, 340, 'C', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(600, 470, 'D', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(760, 470, 'E', 'url(#leafGrad)', '#A7F3D0', is_active=True)}

    {callout(960, 290, 'LEAF [C]', '#064E3B', '#10B981', '#D1FAE5', (960, 310))}
    {callout(680, 535, 'LEAVES [D, E] (No Children)', '#064E3B', '#10B981', '#D1FAE5')}
  </g>
"""
stages.append((c, "04. Leaf Nodes", "A node with no children is a leaf node", "Let's learn more tree terminology. A node with no children is a leaf.", 3.5))

# Stage 09 (23.5s - 26.5s): Degree Calculation
c = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="170" fill="#FFFFFF" font-size="20" font-weight="800">Degree of a Node</text>

    <g transform="translate(85, 200)">
      <rect width="330" height="85" rx="10" fill="#1E1B4B" stroke="#6366F1" stroke-width="2"/>
      <text x="20" y="28" fill="#C7D2FE" font-size="14" font-weight="800">DEGREE = NUMBER OF CHILDREN</text>
      <text x="20" y="52" fill="#EEF2FF" font-size="13">Degree of B = 2 (Children D &amp; E)</text>
      <text x="20" y="72" fill="#C7D2FE" font-size="12">Degree of Leaves = 0</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    {edge(820, 220, 680, 340, '#818CF8', 3)}
    {edge(820, 220, 960, 340, '#818CF8', 3)}
    {edge(680, 340, 600, 470, '#38BDF8', 4)}
    {edge(680, 340, 760, 470, '#38BDF8', 4)}

    {node(820, 220, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(680, 340, 'B', 'url(#parentGrad)', '#BFDBFE', is_active=True)}
    {node(960, 340, 'C', 'url(#leafGrad)', '#A7F3D0')}
    {node(600, 470, 'D', 'url(#leafGrad)', '#A7F3D0')}
    {node(760, 470, 'E', 'url(#leafGrad)', '#A7F3D0')}

    {callout(570, 340, 'Degree(B) = 2', '#1E3A8A', '#3B82F6', '#DBEAFE', (650, 340))}
    {callout(820, 165, 'Degree(A) = 2', '#3B0764', '#A855F7', '#F5D0FE')}
  </g>
"""
stages.append((c, "04. Degree of a Node", "A node's degree is its number of children", "A node's degree is its number of children.", 3.0))

# Stage 10 (26.5s - 33.0s): Level, Depth, Height, Subtree
c = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="170" fill="#FFFFFF" font-size="20" font-weight="800">Tree Metrics</text>

    <g transform="translate(85, 200)">
      <rect width="330" height="50" rx="8" fill="#1E1B4B" stroke="#6366F1" stroke-width="1"/>
      <text x="15" y="30" fill="#C7D2FE" font-size="13" font-weight="700">LEVEL 0 (Root), LEVEL 1, LEVEL 2</text>
    </g>

    <g transform="translate(85, 260)">
      <rect width="330" height="50" rx="8" fill="#3B0764" stroke="#A855F7" stroke-width="1"/>
      <text x="15" y="30" fill="#F0ABFC" font-size="13" font-weight="700">DEPTH: Edges from Root to node</text>
    </g>

    <g transform="translate(85, 320)">
      <rect width="330" height="50" rx="8" fill="#0C4A6E" stroke="#0284C7" stroke-width="1"/>
      <text x="15" y="30" fill="#7DD3FC" font-size="13" font-weight="700">HEIGHT: Maximum depth = 2 edges</text>
    </g>

    <g transform="translate(85, 380)">
      <rect width="330" height="50" rx="8" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
      <text x="15" y="30" fill="#A7F3D0" font-size="13" font-weight="700">SUBTREE: Node B &amp; all descendants</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

    <line x1="500" y1="220" x2="1140" y2="220" stroke="#8B5CF6" stroke-dasharray="4,4" stroke-width="1.5"/>
    <text x="1150" y="225" fill="#C4B5FD" font-size="11" font-weight="800">LEVEL 0</text>

    <line x1="500" y1="340" x2="1140" y2="340" stroke="#3B82F6" stroke-dasharray="4,4" stroke-width="1.5"/>
    <text x="1150" y="345" fill="#93C5FD" font-size="11" font-weight="800">LEVEL 1</text>

    <line x1="500" y1="470" x2="1140" y2="470" stroke="#10B981" stroke-dasharray="4,4" stroke-width="1.5"/>
    <text x="1150" y="475" fill="#A7F3D0" font-size="11" font-weight="800">LEVEL 2</text>

    <rect x="560" y="295" width="280" height="230" rx="16" fill="#6366F1" fill-opacity="0.1" stroke="#818CF8" stroke-width="1.5" stroke-dasharray="5,5"/>
    <text x="700" y="315" fill="#C7D2FE" font-size="11" font-weight="800" text-anchor="middle">SUBTREE OF B</text>

    {edge(820, 220, 680, 340, '#818CF8', 3)}
    {edge(820, 220, 960, 340, '#818CF8', 3)}
    {edge(680, 340, 600, 470, '#10B981', 3.5)}
    {edge(680, 340, 760, 470, '#10B981', 3.5)}

    {node(820, 220, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(680, 340, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(960, 340, 'C', 'url(#leafGrad)', '#A7F3D0')}
    {node(600, 470, 'D', 'url(#leafGrad)', '#A7F3D0')}
    {node(760, 470, 'E', 'url(#leafGrad)', '#A7F3D0')}
  </g>
"""
stages.append((c, "05. Measuring Trees", "Level, Depth, Height and Subtree boundaries", "A node and its descendants form a subtree.", 6.5))

# Stage 11 (33.0s - 36.5s): General Tree Branching
c = f"""
  <g>
    <rect x="60" y="130" width="560" height="460" rx="16" fill="url(#cardGrad)" stroke="#38BDF8" stroke-width="2"/>
    <text x="85" y="180" fill="#FFFFFF" font-size="22" font-weight="800">1. General Tree</text>
    <text x="85" y="210" fill="#38BDF8" font-size="15" font-weight="700">Any Number of Children Per Node</text>

    {edge(340, 280, 180, 390, '#38BDF8', 3.5, animated_pulse=True)}
    {edge(340, 280, 340, 390, '#38BDF8', 3.5, animated_pulse=True)}
    {edge(340, 280, 500, 390, '#38BDF8', 3.5, animated_pulse=True)}

    {node(340, 280, 'A', 'url(#rootGrad)', '#DDD6FE', is_active=True)}
    {node(180, 390, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(340, 390, 'C', 'url(#parentGrad)', '#BFDBFE')}
    {node(500, 390, 'D', 'url(#parentGrad)', '#BFDBFE')}

    {callout(340, 480, 'Root A branches into 3 children (B, C, D)', '#0C4A6E', '#0284C7', '#BAE6FD')}
  </g>
  <g>
    <rect x="660" y="130" width="560" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1"/>
    <text x="685" y="180" fill="#94A3B8" font-size="22" font-weight="700">3 Basic Tree Types</text>
    <text x="685" y="220" fill="#CBD5E1" font-size="14">General Trees have no branching restrictions.</text>
    <text x="685" y="250" fill="#CBD5E1" font-size="14">Used in file directory hierarchies and organizational charts.</text>
  </g>
"""
stages.append((c, "06. General Tree", "A general tree can have any number of children", "There are 3 basic types of trees. A general tree can have any number of children.", 3.5))

# Stage 12 (36.5s - 39.5s): Binary Tree Limits
c = f"""
  <g>
    <rect x="60" y="130" width="560" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1"/>
    <text x="85" y="180" fill="#94A3B8" font-size="20" font-weight="700">General Tree: Multi-branch</text>
    {edge(340, 280, 220, 380, '#475569', 2)}
    {edge(340, 280, 340, 380, '#475569', 2)}
    {edge(340, 280, 460, 380, '#475569', 2)}
    {node(340, 280, 'A', '#1E293B', '#475569', '#94A3B8')}
    {node(220, 380, 'B', '#1E293B', '#475569', '#94A3B8')}
    {node(340, 380, 'C', '#1E293B', '#475569', '#94A3B8')}
    {node(460, 380, 'D', '#1E293B', '#475569', '#94A3B8')}
  </g>
  <g>
    <rect x="660" y="130" width="560" height="460" rx="16" fill="url(#cardGrad)" stroke="#6366F1" stroke-width="2"/>
    <text x="685" y="180" fill="#FFFFFF" font-size="22" font-weight="800">2. Binary Tree</text>
    <text x="685" y="210" fill="#A5B4FC" font-size="15" font-weight="700">At Most 2 Children (Left &amp; Right)</text>

    {edge(940, 280, 840, 390, '#818CF8', 4, animated_pulse=True)}
    {edge(940, 280, 1040, 390, '#818CF8', 4, animated_pulse=True)}

    {node(940, 280, 'A', 'url(#rootGrad)', '#DDD6FE', is_active=True)}
    {node(840, 390, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(1040, 390, 'C', 'url(#parentGrad)', '#BFDBFE')}

    {callout(840, 470, 'LEFT CHILD', '#1E3A8A', '#3B82F6', '#DBEAFE')}
    {callout(1040, 470, 'RIGHT CHILD', '#064E3B', '#10B981', '#D1FAE5')}
  </g>
"""
stages.append((c, "06. Binary Tree", "A binary tree has at most 2 children: left and right", "A binary tree has at most 2 children, left and right.", 3.0))

# Stage 13 (39.5s - 44.5s): BST Working Search
c = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#10B981" stroke-width="2"/>
    <text x="85" y="175" fill="#FFFFFF" font-size="24" font-weight="800">3. Binary Search Tree (BST) — Working Operation</text>
    <text x="85" y="205" fill="#34D399" font-size="15" font-weight="600">Invariant: Smaller values go Left (&lt;), Greater values go Right (&gt;)</text>

    {edge(640, 270, 460, 370, '#38BDF8', 4, animated_pulse=True)}
    {edge(640, 270, 820, 370, '#34D399', 4, animated_pulse=True)}

    {node(640, 270, '50', 'url(#rootGrad)', '#DDD6FE', is_active=True)}
    {node(460, 370, '30', 'url(#parentGrad)', '#BFDBFE', is_active=True)}
    {node(820, 370, '70', 'url(#leafGrad)', '#A7F3D0', is_active=True)}

    {callout(370, 310, '30 &lt; 50 → GO LEFT', '#0C4A6E', '#0284C7', '#BAE6FD')}
    {callout(910, 310, '70 &gt; 50 → GO RIGHT', '#064E3B', '#10B981', '#D1FAE5')}

    <rect x="340" y="460" width="600" height="60" rx="12" fill="#0B132B" stroke="#10B981" stroke-width="1.5"/>
    <text x="640" y="495" fill="#D1FAE5" font-size="15" font-weight="700" text-anchor="middle">Logarithmic Search Speed: O(log N) average time!</text>
  </g>
"""
stages.append((c, "07. Binary Search Tree", "In a BST, smaller values go left, greater go right", "In a BST, smaller values go left, and greater values go right. These are the main types.", 5.0))

# Stage 14 (44.5s - 48.5s): 5 Binary Tree Types Intro
c = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#8B5CF6" stroke-width="2"/>
    <text x="85" y="180" fill="#FFFFFF" font-size="24" font-weight="800">5 Types of Binary Trees</text>
    <text x="85" y="210" fill="#C4B5FD" font-size="15" font-weight="600">Classification by Branching and Structural Balance</text>

    <g transform="translate(140, 270)">
      <rect width="180" height="180" rx="14" fill="#1E1B4B" stroke="#6366F1" stroke-width="2"/>
      <text x="90" y="40" fill="#C7D2FE" font-size="14" font-weight="800" text-anchor="middle">1. STRICTLY</text>
      <text x="90" y="90" fill="#FFFFFF" font-size="28" font-weight="900" text-anchor="middle">0 or 2</text>
      <text x="90" y="130" fill="#94A3B8" font-size="12" font-weight="600" text-anchor="middle">Children per node</text>
    </g>

    <g transform="translate(340, 270)">
      <rect width="180" height="180" rx="14" fill="#1E3A8A" stroke="#3B82F6" stroke-width="2"/>
      <text x="90" y="40" fill="#BFDBFE" font-size="14" font-weight="800" text-anchor="middle">2. FULL</text>
      <text x="90" y="90" fill="#FFFFFF" font-size="28" font-weight="900" text-anchor="middle">All 2</text>
      <text x="90" y="130" fill="#94A3B8" font-size="12" font-weight="600" text-anchor="middle">Internal nodes full</text>
    </g>

    <g transform="translate(540, 270)">
      <rect width="180" height="180" rx="14" fill="#064E3B" stroke="#10B981" stroke-width="2"/>
      <text x="90" y="40" fill="#A7F3D0" font-size="14" font-weight="800" text-anchor="middle">3. COMPLETE</text>
      <text x="90" y="90" fill="#FFFFFF" font-size="28" font-weight="900" text-anchor="middle">L → R</text>
      <text x="90" y="130" fill="#94A3B8" font-size="12" font-weight="600" text-anchor="middle">Left-to-right fill</text>
    </g>

    <g transform="translate(740, 270)">
      <rect width="180" height="180" rx="14" fill="#451A03" stroke="#F59E0B" stroke-width="2"/>
      <text x="90" y="40" fill="#FDE68A" font-size="14" font-weight="800" text-anchor="middle">4. PERFECT</text>
      <text x="90" y="90" fill="#FFFFFF" font-size="28" font-weight="900" text-anchor="middle">100%</text>
      <text x="90" y="130" fill="#94A3B8" font-size="12" font-weight="600" text-anchor="middle">Saturated triangle</text>
    </g>

    <g transform="translate(940, 270)">
      <rect width="180" height="180" rx="14" fill="#450A0A" stroke="#EF4444" stroke-width="2"/>
      <text x="90" y="40" fill="#FCA5A5" font-size="14" font-weight="800" text-anchor="middle">5. DEGENERATE</text>
      <text x="90" y="90" fill="#FFFFFF" font-size="28" font-weight="900" text-anchor="middle">Linear</text>
      <text x="90" y="130" fill="#94A3B8" font-size="12" font-weight="600" text-anchor="middle">1 child per node</text>
    </g>
  </g>
"""
stages.append((c, "08. Binary Tree Variations", "5 Core Types: Strictly, Full, Complete, Perfect, Degenerate", "Let's learn 5 types of binary trees.", 4.0))

# Stage 15 (48.5s - 52.0s): Strictly Binary Working Tree
c = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#8B5CF6" stroke-width="2"/>
    <text x="85" y="175" fill="#FFFFFF" font-size="24" font-weight="800">1. Strictly Binary Tree</text>
    <text x="85" y="205" fill="#C4B5FD" font-size="15" font-weight="600">Every node has EITHER 0 OR 2 CHILDREN (No 1-child nodes permitted)</text>

    {edge(640, 280, 500, 380, '#818CF8', 3.5)}
    {edge(640, 280, 780, 380, '#818CF8', 3.5)}
    {edge(500, 380, 420, 480, '#818CF8', 3.5)}
    {edge(500, 380, 580, 480, '#818CF8', 3.5)}

    {node(640, 280, '10', 'url(#rootGrad)', '#DDD6FE')}
    {node(500, 380, '5', 'url(#parentGrad)', '#BFDBFE')}
    {node(780, 380, '15', 'url(#leafGrad)', '#A7F3D0')}
    {node(420, 480, '2', 'url(#leafGrad)', '#A7F3D0')}
    {node(580, 480, '7', 'url(#leafGrad)', '#A7F3D0')}

    {callout(780, 430, '0 Children (Leaf) ✓', '#064E3B', '#10B981', '#D1FAE5')}
    {callout(500, 535, '2 Children (2 &amp; 7) ✓', '#1E3A8A', '#3B82F6', '#DBEAFE')}
    {callout(1020, 380, 'VALID STRICT BINARY', '#312E81', '#818CF8', '#EEF2FF')}
  </g>
"""
stages.append((c, "08. Strictly Binary Tree", "A strictly binary tree has either 0 or 2 children", "A strictly binary tree has either 0 or 2 children.", 3.5))

# Stage 16 (52.0s - 56.5s): Full Binary Tree
c = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#3B82F6" stroke-width="2"/>
    <text x="85" y="175" fill="#FFFFFF" font-size="24" font-weight="800">2. Full Binary Tree</text>
    <text x="85" y="205" fill="#93C5FD" font-size="15" font-weight="600">All internal nodes have 2 children, all leaves are at the lowest level</text>

    {edge(640, 270, 480, 360, '#60A5FA', 3.5)}
    {edge(640, 270, 800, 360, '#60A5FA', 3.5)}
    {edge(480, 360, 400, 460, '#60A5FA', 3)}
    {edge(480, 360, 560, 460, '#60A5FA', 3)}
    {edge(800, 360, 720, 460, '#60A5FA', 3)}
    {edge(800, 360, 880, 460, '#60A5FA', 3)}

    {node(640, 270, '40', 'url(#rootGrad)', '#DDD6FE')}
    {node(480, 360, '20', 'url(#parentGrad)', '#BFDBFE')}
    {node(800, 360, '60', 'url(#parentGrad)', '#BFDBFE')}
    {node(400, 460, '10', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(560, 460, '30', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(720, 460, '50', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(880, 460, '70', 'url(#leafGrad)', '#A7F3D0', is_active=True)}

    {callout(640, 535, 'All Leaves (10, 30, 50, 70) align at identical depth level', '#064E3B', '#10B981', '#D1FAE5')}
  </g>
"""
stages.append((c, "09. Full Binary Tree", "All internal nodes have 2 children; all leaves at the same level", "Full binary tree.", 4.5))

# Stage 17 (56.5s - 61.0s): Complete Binary Tree
c = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#10B981" stroke-width="2"/>
    <text x="85" y="175" fill="#FFFFFF" font-size="24" font-weight="800">3. Complete Binary Tree</text>
    <text x="85" y="205" fill="#34D399" font-size="15" font-weight="600">All levels filled completely; bottom level filled Left-to-Right without gaps</text>

    {edge(640, 270, 480, 360, '#34D399', 3.5)}
    {edge(640, 270, 800, 360, '#34D399', 3.5)}
    {edge(480, 360, 400, 460, '#34D399', 3.5, animated_pulse=True)}
    {edge(480, 360, 560, 460, '#34D399', 3.5, animated_pulse=True)}
    {edge(800, 360, 720, 460, '#34D399', 3.5, animated_pulse=True)}

    {node(640, 270, '25', 'url(#rootGrad)', '#DDD6FE')}
    {node(480, 360, '15', 'url(#parentGrad)', '#BFDBFE')}
    {node(800, 360, '35', 'url(#parentGrad)', '#BFDBFE')}
    {node(400, 460, '10', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(560, 460, '20', 'url(#leafGrad)', '#A7F3D0', is_active=True)}
    {node(720, 460, '30', 'url(#leafGrad)', '#A7F3D0', is_active=True)}

    {callout(560, 535, 'Filled sequentially from left to right: 10 → 20 → 30', '#064E3B', '#10B981', '#D1FAE5')}
  </g>
"""
stages.append((c, "10. Complete Binary Tree", "All levels filled completely; bottom level filled left-to-right", "Complete binary tree.", 4.5))

# Stage 18 (61.0s - 66.0s): Perfect Binary Tree
c = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#F59E0B" stroke-width="2"/>
    <text x="85" y="175" fill="#FFFFFF" font-size="24" font-weight="800">4. Perfect Binary Tree</text>
    <text x="85" y="205" fill="#FBBF24" font-size="15" font-weight="600">Every internal node has 2 children; all leaves at the exact same depth</text>

    {edge(640, 270, 480, 360, '#FBBF24', 3.5)}
    {edge(640, 270, 800, 360, '#FBBF24', 3.5)}
    {edge(480, 360, 400, 460, '#FBBF24', 3)}
    {edge(480, 360, 560, 460, '#FBBF24', 3)}
    {edge(800, 360, 720, 460, '#FBBF24', 3)}
    {edge(800, 360, 880, 460, '#FBBF24', 3)}

    {node(640, 270, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(480, 360, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(800, 360, 'C', 'url(#parentGrad)', '#BFDBFE')}
    {node(400, 460, 'D', 'url(#leafGrad)', '#A7F3D0')}
    {node(560, 460, 'E', 'url(#leafGrad)', '#A7F3D0')}
    {node(720, 460, 'F', 'url(#leafGrad)', '#A7F3D0')}
    {node(880, 460, 'G', 'url(#leafGrad)', '#A7F3D0')}

    {callout(640, 535, 'Total Nodes = 2^(h+1) - 1 = 7 nodes (Completely saturated)', '#78350F', '#F59E0B', '#FEF3C7')}
  </g>
"""
stages.append((c, "11. Perfect Binary Tree", "All internal nodes have 2 children; all leaves at the same level", "A perfect binary tree has two children at every internal node, and all leaves are at the same level.", 5.0))

# Stage 19 (66.0s - 70.0s): Degenerate Tree
c = f"""
  <g>
    <rect x="60" y="130" width="560" height="460" rx="16" fill="url(#cardGrad)" stroke="#EF4444" stroke-width="2"/>
    <text x="85" y="175" fill="#FFFFFF" font-size="22" font-weight="800">5. Degenerate (Skewed) Tree</text>
    <text x="85" y="205" fill="#F87171" font-size="14" font-weight="600">Every parent node has ONLY ONE child</text>

    {edge(200, 270, 260, 330, '#F87171', 4, animated_pulse=True)}
    {edge(260, 330, 320, 390, '#F87171', 4, animated_pulse=True)}
    {edge(320, 390, 380, 450, '#F87171', 4, animated_pulse=True)}
    {edge(380, 450, 440, 510, '#F87171', 4, animated_pulse=True)}

    {node(200, 270, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(260, 330, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(320, 390, 'C', 'url(#parentGrad)', '#BFDBFE')}
    {node(380, 450, 'D', 'url(#parentGrad)', '#BFDBFE')}
    {node(440, 510, 'E', 'url(#leafGrad)', '#A7F3D0')}

    {callout(320, 555, 'Functions identically to a Linked List: O(N) linear time', '#450A0A', '#EF4444', '#FEE2E2')}
  </g>
  <g>
    <rect x="660" y="130" width="560" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="690" y="180" fill="#FFFFFF" font-size="22" font-weight="800">Skewed Worst-Case</text>
    <text x="690" y="220" fill="#CBD5E1" font-size="14">When a binary tree becomes degenerate,</text>
    <text x="690" y="250" fill="#CBD5E1" font-size="14">all logarithmic search benefits are lost.</text>
    <text x="690" y="290" fill="#F87171" font-size="15" font-weight="700">Height H = N - 1</text>
    <text x="690" y="325" fill="#CBD5E1" font-size="14">Search, Insert, and Delete degrade to O(N).</text>
  </g>
"""
stages.append((c, "12. Degenerate Binary Tree", "Degenerate tree has one child per node", "Degenerate binary tree: one child per node.", 4.0))

# Stage 20 (70.0s - 75.36s): Grand Summary Checklist
c = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#6366F1" stroke-width="2"/>
    <text x="90" y="175" fill="#FFFFFF" font-size="24" font-weight="800">Masterclass Summary: 5 Binary Tree Types</text>

    <g transform="translate(90, 205)">
      <rect width="1100" height="48" rx="10" fill="#1E1B4B" stroke="#6366F1" stroke-width="1"/>
      <text x="30" y="30" fill="#A5B4FC" font-size="14" font-weight="800">✓ 1. Strictly Binary</text>
      <text x="240" y="30" fill="#E0E7FF" font-size="13">Every node has either 0 or 2 children</text>
    </g>

    <g transform="translate(90, 265)">
      <rect width="1100" height="48" rx="10" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1"/>
      <text x="30" y="30" fill="#93C5FD" font-size="14" font-weight="800">✓ 2. Full Binary</text>
      <text x="240" y="30" fill="#E0F2FE" font-size="13">All internal nodes have 2 children; all leaves at the same lowest level</text>
    </g>

    <g transform="translate(90, 325)">
      <rect width="1100" height="48" rx="10" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
      <text x="30" y="30" fill="#6EE7B7" font-size="14" font-weight="800">✓ 3. Complete Binary</text>
      <text x="240" y="30" fill="#ECFDF5" font-size="13">All levels completely filled; bottom level filled left-to-right without gaps</text>
    </g>

    <g transform="translate(90, 385)">
      <rect width="1100" height="48" rx="10" fill="#451A03" stroke="#F59E0B" stroke-width="1"/>
      <text x="30" y="30" fill="#FDE68A" font-size="14" font-weight="800">✓ 4. Perfect Binary</text>
      <text x="240" y="30" fill="#FFFBEB" font-size="13">Completely filled triangle; maximum saturated capacity 2^(h+1) - 1 nodes</text>
    </g>

    <g transform="translate(90, 445)">
      <rect width="1100" height="48" rx="10" fill="#450A0A" stroke="#EF4444" stroke-width="1"/>
      <text x="30" y="30" fill="#FCA5A5" font-size="14" font-weight="800">✓ 5. Degenerate</text>
      <text x="240" y="30" fill="#FEF2F2" font-size="13">Every parent node has 1 child; linear chain functioning like a Linked List</text>
    </g>

    <g transform="translate(90, 510)">
      <rect width="1100" height="45" rx="10" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
      <text x="550" y="28" fill="#38BDF8" font-size="14" font-weight="800" text-anchor="middle">🎉 Congratulations! You have mastered Tree Data Structures &amp; BST!</text>
    </g>
  </g>
"""
stages.append((c, "12. Complete Binary Tree Review", "These are the main types of binary trees", "These are the main types of binary trees.", 5.36))

print(f"Generating and validating {len(stages)} progressive working stages...")

concat_lines = []
total_time = 0

for idx, (content, title, subtitle, narration, duration) in enumerate(stages, start=1):
    svg_str = make_svg(content, title, subtitle, narration, idx, len(stages))
    svg_file = f"{SCENES_DIR}/stage_{idx:02d}.svg"
    png_file = f"{SCENES_DIR}/stage_{idx:02d}.png"
    
    with open(svg_file, "w") as f:
        f.write(svg_str)
        
    try:
        ET.fromstring(svg_str)
    except Exception as e:
        print(f"Error in stage {idx}: {e}")
        raise e
        
    cmd = f"ffmpeg -y -i {svg_file} {png_file}"
    subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Stage {idx:02d} rendered ({duration}s): {title}")
    
    concat_lines.append(f"file '{png_file}'")
    concat_lines.append(f"duration {duration:.2f}")
    total_time += duration

# Concat requires repeating the last file
concat_lines.append(concat_lines[-2])

concat_txt = f"{SCENES_DIR}/concat_animated.txt"
with open(concat_txt, "w") as f:
    f.write("\n".join(concat_lines) + "\n")

print(f"Total animation time: {total_time:.2f}s. Building video with ffmpeg...")
final_video = "/tmp/working_lesson.mp4"
build_cmd = (
    f"ffmpeg -y -f concat -safe 0 -i {concat_txt} "
    f"-i /tmp/voiceover.aac "
    f"-c:v libx264 -pix_fmt yuv420p -r 25 -preset medium -crf 20 "
    f"-c:a aac -b:a 128k -shortest "
    f"{final_video}"
)
subprocess.run(build_cmd, shell=True, check=True)

print("Working animated video rendered at", final_video)
