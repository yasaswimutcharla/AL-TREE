import os
import subprocess
import xml.etree.ElementTree as ET

SCENES_DIR = "/tmp/video_scenes"
os.makedirs(SCENES_DIR, exist_ok=True)

def escape_xml(s):
    return (s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;")
             .replace('"', "&quot;")
             .replace("'", "&apos;"))

def make_svg(content, title, subtitle, narration, part_tag="TREE DSA MASTERCLASS"):
    t_title = escape_xml(title)
    t_sub = escape_xml(subtitle)
    t_narr = escape_xml(narration)
    t_part = escape_xml(part_tag)
    
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
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#0F172A" stop-opacity="0.95"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1280" height="720" fill="url(#bgGrad)"/>

  <!-- Subtle Decorative Grid Lines -->
  <g opacity="0.07" stroke="#6366F1" stroke-width="1">
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
  <circle cx="240" cy="180" r="160" fill="#4F46E5" opacity="0.08" filter="url(#glow)"/>
  <circle cx="1060" cy="380" r="200" fill="#7C3AED" opacity="0.08" filter="url(#glow)"/>

  <!-- TOP HEADER BAR -->
  <rect x="0" y="0" width="1280" height="85" fill="#060913" fill-opacity="0.95"/>
  <line x1="0" y1="85" x2="1280" y2="85" stroke="#1E293B" stroke-width="1.5"/>

  <!-- Brand & Topic Tag -->
  <rect x="40" y="24" width="135" height="36" rx="8" fill="#1E1B4B" stroke="#4338CA" stroke-width="1.5"/>
  <text x="107" y="47" fill="#A5B4FC" font-size="13" font-weight="800" letter-spacing="1.5" text-anchor="middle">ALGOLEARN</text>

  <rect x="185" y="24" width="200" height="36" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1"/>
  <text x="285" y="47" fill="#38BDF8" font-size="12" font-weight="700" letter-spacing="1" text-anchor="middle">{t_part}</text>

  <!-- Header Titles -->
  <text x="410" y="44" fill="#FFFFFF" font-size="22" font-weight="800">{t_title}</text>
  <text x="410" y="66" fill="#94A3B8" font-size="13" font-weight="500">{t_sub}</text>

  <!-- Right Visual Lesson Badge -->
  <rect x="1100" y="24" width="140" height="36" rx="8" fill="#312E81" fill-opacity="0.6" stroke="#6366F1" stroke-width="1"/>
  <circle cx="1120" cy="42" r="5" fill="#10B981"/>
  <text x="1178" y="47" fill="#E0E7FF" font-size="12" font-weight="700" text-anchor="middle">VISUAL GUIDE</text>

  <!-- MAIN CANVAS (Y: 95 to 610) -->
  {content}

  <!-- BOTTOM NARRATION BAR (NEVER OVERLAPS DIAGRAM) -->
  <rect x="40" y="625" width="1200" height="72" rx="16" fill="#0B0F19" fill-opacity="0.96" stroke="#334155" stroke-width="1.5"/>
  <rect x="52" y="637" width="34" height="48" rx="8" fill="#4F46E5" fill-opacity="0.3"/>
  <text x="69" y="666" fill="#818CF8" font-size="16" font-weight="bold" text-anchor="middle">🎙</text>

  <text x="102" y="654" fill="#94A3B8" font-size="11" font-weight="700" letter-spacing="1">AUDIO NARRATION</text>
  <text x="102" y="677" fill="#FFFFFF" font-size="16" font-weight="600">{t_narr}</text>
</svg>"""

def edge(x1, y1, x2, y2, color="#64748B", width=3, dashed=False):
    dash_attr = 'stroke-dasharray="6,6"' if dashed else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}" stroke-linecap="round" {dash_attr}/>'

def node(cx, cy, val, fill="url(#parentGrad)", stroke="#93C5FD", textColor="#FFFFFF"):
    return f"""<g>
    <circle cx="{cx}" cy="{cy}" r="28" fill="{fill}" stroke="{stroke}" stroke-width="2.5" filter="url(#glow)"/>
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
# 12 Master Scenes
# =========================================================================
scenes = []

# Scene 1: Introduction to Trees (0.0s - 4.8s, duration: 4.8s)
s1_content = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <rect x="85" y="155" width="130" height="28" rx="6" fill="#312E81" stroke="#4338CA" stroke-width="1"/>
    <text x="150" y="174" fill="#C7D2FE" font-size="12" font-weight="800" text-anchor="middle">HIERARCHY</text>
    
    <text x="85" y="215" fill="#FFFFFF" font-size="22" font-weight="800">What is a Tree?</text>
    <text x="85" y="250" fill="#CBD5E1" font-size="14">A non-linear hierarchical data structure</text>
    <text x="85" y="275" fill="#CBD5E1" font-size="14">where items branch out downward</text>
    <text x="85" y="300" fill="#CBD5E1" font-size="14">from a single starting point.</text>

    <g transform="translate(85, 330)">
      <rect width="330" height="60" rx="10" fill="#0B132B" stroke="#6366F1" stroke-width="1"/>
      <circle cx="20" cy="30" r="8" fill="#8B5CF6"/>
      <text x="40" y="26" fill="#C7D2FE" font-size="13" font-weight="800">Root Node</text>
      <text x="40" y="46" fill="#94A3B8" font-size="12">Topmost node with no parent</text>
    </g>

    <g transform="translate(85, 405)">
      <rect width="330" height="60" rx="10" fill="#0B132B" stroke="#3B82F6" stroke-width="1"/>
      <circle cx="20" cy="30" r="8" fill="#3B82F6"/>
      <text x="40" y="26" fill="#93C5FD" font-size="13" font-weight="800">Edges &amp; Branches</text>
      <text x="40" y="46" fill="#94A3B8" font-size="12">Links connecting parent to children</text>
    </g>

    <g transform="translate(85, 480)">
      <rect width="330" height="60" rx="10" fill="#0B132B" stroke="#10B981" stroke-width="1"/>
      <circle cx="20" cy="30" r="8" fill="#10B981"/>
      <text x="40" y="26" fill="#A7F3D0" font-size="13" font-weight="800">Subtrees</text>
      <text x="40" y="46" fill="#94A3B8" font-size="12">Self-similar smaller trees branching out</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

    {edge(850, 220, 710, 340, '#818CF8', 3.5)}
    {edge(850, 220, 990, 340, '#818CF8', 3.5)}
    {edge(710, 340, 630, 470, '#64748B', 3)}
    {edge(710, 340, 790, 470, '#64748B', 3)}

    {node(850, 220, '10', 'url(#rootGrad)', '#DDD6FE')}
    {node(710, 340, '5', 'url(#parentGrad)', '#BFDBFE')}
    {node(990, 340, '20', 'url(#leafGrad)', '#A7F3D0')}
    {node(630, 470, '2', 'url(#leafGrad)', '#A7F3D0')}
    {node(790, 470, '7', 'url(#leafGrad)', '#A7F3D0')}

    {callout(850, 160, 'ROOT NODE [10] (Depth 0)', '#3B0764', '#A855F7', '#F3E8FF', (850, 190))}
    {callout(610, 340, 'INTERNAL NODE [5]', '#1E1B4B', '#3B82F6', '#DBEAFE', (680, 340))}
    {callout(1085, 340, 'LEAF NODE [20]', '#064E3B', '#10B981', '#D1FAE5', (1020, 340))}
    {callout(710, 540, 'CHILDREN OF 5: [2] and [7]', '#064E3B', '#10B981', '#D1FAE5', (710, 500))}
  </g>
"""
scenes.append((
    s1_content,
    "01. Introduction to Tree Structure",
    "A tree branches downward from a single top node called the root",
    "This is a simple tree. The top node is called the root.",
    "PART 1: TREE FUNDAMENTALS",
    4.8
))

# Scene 2: Parent & Child (4.8s - 9.5s, duration: 4.7s)
s2_content = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <rect x="85" y="155" width="160" height="28" rx="6" fill="#1E3A8A" stroke="#2563EB" stroke-width="1"/>
    <text x="165" y="174" fill="#BFDBFE" font-size="12" font-weight="800" text-anchor="middle">RELATIONSHIPS</text>
    
    <text x="85" y="215" fill="#FFFFFF" font-size="22" font-weight="800">Parent &amp; Child Nodes</text>

    <g transform="translate(85, 250)">
      <rect width="330" height="85" rx="10" fill="#0B132B" stroke="#2563EB" stroke-width="1.5"/>
      <text x="15" y="26" fill="#60A5FA" font-size="14" font-weight="700">Node [5] = Parent Node</text>
      <text x="15" y="50" fill="#CBD5E1" font-size="13">Directly precedes nodes 2 &amp; 7.</text>
      <text x="15" y="70" fill="#CBD5E1" font-size="13">Has an outgoing edge to each child.</text>
    </g>

    <g transform="translate(85, 350)">
      <rect width="330" height="85" rx="10" fill="#0B132B" stroke="#10B981" stroke-width="1.5"/>
      <text x="15" y="26" fill="#34D399" font-size="14" font-weight="700">Nodes [2, 7] = Children</text>
      <text x="15" y="50" fill="#CBD5E1" font-size="13">Directly connected below parent 5.</text>
      <text x="15" y="70" fill="#CBD5E1" font-size="13">Nodes 2 and 7 are also Siblings.</text>
    </g>

    <g transform="translate(85, 450)">
      <rect width="330" height="65" rx="10" fill="#1E1B4B" stroke="#6366F1" stroke-width="1"/>
      <text x="15" y="26" fill="#A5B4FC" font-size="13" font-weight="700">Key Golden Rule:</text>
      <text x="15" y="48" fill="#E0E7FF" font-size="12">Every node except the root has exactly ONE parent.</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

    {edge(850, 220, 710, 340, '#475569', 2.5)}
    {edge(850, 220, 990, 340, '#475569', 2.5)}
    {edge(710, 340, 630, 470, '#38BDF8', 4)}
    {edge(710, 340, 790, 470, '#38BDF8', 4)}

    {node(850, 220, '10', '#1E293B', '#475569', '#94A3B8')}
    {node(710, 340, '5', 'url(#parentGrad)', '#93C5FD')}
    {node(990, 340, '20', '#1E293B', '#475569', '#94A3B8')}
    {node(630, 470, '2', 'url(#leafGrad)', '#A7F3D0')}
    {node(790, 470, '7', 'url(#leafGrad)', '#A7F3D0')}

    {callout(710, 280, 'PARENT NODE [5]', '#1E3A8A', '#3B82F6', '#DBEAFE', (710, 310))}
    {callout(630, 535, 'CHILD [2]', '#064E3B', '#10B981', '#D1FAE5', (630, 500))}
    {callout(790, 535, 'CHILD [7]', '#064E3B', '#10B981', '#D1FAE5', (790, 500))}
    {callout(710, 420, 'DIRECT EDGES', '#0F172A', '#38BDF8', '#E0F2FE')}
    {callout(1050, 470, 'SIBLINGS: 2 &amp; 7 share parent 5', '#312E81', '#818CF8', '#EEF2FF')}
  </g>
"""
scenes.append((
    s2_content,
    "02. Parent & Child Hierarchy",
    "5 is the parent node of children 2 and 7",
    "5 is a parent of 2 and 7.",
    "PART 1: TREE FUNDAMENTALS",
    4.7
))

# Scene 3: Tree Terminology - Node, Root, Edges, Siblings (9.5s - 20.0s, duration: 10.5s)
s3_content = f"""
  <g>
    <rect x="60" y="130" width="400" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="170" fill="#FFFFFF" font-size="20" font-weight="800">Core Terminology (Part 1)</text>

    <g transform="translate(85, 195)">
      <rect width="350" height="65" rx="10" fill="#1E1B4B" stroke="#6366F1" stroke-width="1.5"/>
      <circle cx="25" cy="32" r="14" fill="#8B5CF6"/>
      <text x="25" y="37" fill="#FFF" font-size="12" font-weight="800" text-anchor="middle">1</text>
      <text x="50" y="27" fill="#A5B4FC" font-size="14" font-weight="800">NODE</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Each individual data-holding element (A, B, C...)</text>
    </g>

    <g transform="translate(85, 270)">
      <rect width="350" height="65" rx="10" fill="#3B0764" stroke="#A855F7" stroke-width="1.5"/>
      <circle cx="25" cy="32" r="14" fill="#7C3AED"/>
      <text x="25" y="37" fill="#FFF" font-size="12" font-weight="800" text-anchor="middle">2</text>
      <text x="50" y="27" fill="#F0ABFC" font-size="14" font-weight="800">ROOT</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">The top node with no parent (Node A)</text>
    </g>

    <g transform="translate(85, 345)">
      <rect width="350" height="65" rx="10" fill="#0C4A6E" stroke="#0284C7" stroke-width="1.5"/>
      <circle cx="25" cy="32" r="14" fill="#0284C7"/>
      <text x="25" y="37" fill="#FFF" font-size="12" font-weight="800" text-anchor="middle">3</text>
      <text x="50" y="27" fill="#7DD3FC" font-size="14" font-weight="800">EDGE</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Connecting line between parent &amp; child</text>
    </g>

    <g transform="translate(85, 420)">
      <rect width="350" height="65" rx="10" fill="#064E3B" stroke="#059669" stroke-width="1.5"/>
      <circle cx="25" cy="32" r="14" fill="#059669"/>
      <text x="25" y="37" fill="#FFF" font-size="12" font-weight="800" text-anchor="middle">4</text>
      <text x="50" y="27" fill="#6EE7B7" font-size="14" font-weight="800">SIBLINGS</text>
      <text x="50" y="47" fill="#CBD5E1" font-size="12">Nodes sharing the same parent (D &amp; E)</text>
    </g>
  </g>

  <g>
    <rect x="500" y="130" width="720" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

    {edge(860, 220, 720, 340, '#38BDF8', 3.5)}
    {edge(860, 220, 1000, 340, '#38BDF8', 3.5)}
    {edge(720, 340, 640, 470, '#38BDF8', 3.5)}
    {edge(720, 340, 800, 470, '#38BDF8', 3.5)}

    <rect x="765" y="260" width="55" height="22" rx="6" fill="#0C4A6E" stroke="#0284C7" stroke-width="1"/>
    <text x="792" y="275" fill="#BAE6FD" font-size="10" font-weight="800" text-anchor="middle">EDGE</text>

    {node(860, 220, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(720, 340, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(1000, 340, 'C', 'url(#leafGrad)', '#A7F3D0')}
    {node(640, 470, 'D', 'url(#leafGrad)', '#A7F3D0')}
    {node(800, 470, 'E', 'url(#leafGrad)', '#A7F3D0')}

    {callout(860, 160, 'ROOT NODE [A] (Level 0)', '#3B0764', '#A855F7', '#F5D0FE', (860, 190))}
    {callout(620, 340, 'PARENT [B]', '#1E3A8A', '#3B82F6', '#DBEAFE', (690, 340))}
    {callout(1100, 340, 'CHILD / LEAF [C]', '#064E3B', '#10B981', '#D1FAE5', (1030, 340))}
    {callout(720, 540, 'SIBLINGS: D and E (Share Parent B)', '#064E3B', '#10B981', '#D1FAE5', (720, 500))}
  </g>
"""
scenes.append((
    s3_content,
    "03. Tree Terminology: Core Concepts",
    "Node, Root, Edges, Parent, and Siblings clearly defined without overlaps",
    "Let's learn tree terms. Each element is a node. The top node is the root. Connecting lines are edges. B is parent of D and E. D and E are siblings.",
    "PART 2: TERMINOLOGY",
    10.5
))

# Scene 4: Leaf Nodes & Degree (20.0s - 26.5s, duration: 6.5s)
s4_content = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="170" fill="#FFFFFF" font-size="20" font-weight="800">Leaf &amp; Degree</text>

    <g transform="translate(85, 200)">
      <rect width="330" height="85" rx="10" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
      <text x="20" y="28" fill="#A7F3D0" font-size="14" font-weight="800">LEAF NODE (External Node)</text>
      <text x="20" y="52" fill="#ECFDF5" font-size="13">A node with NO children.</text>
      <text x="20" y="72" fill="#D1FAE5" font-size="12">Leaves in this tree: Nodes C, D, and E</text>
    </g>

    <g transform="translate(85, 305)">
      <rect width="330" height="85" rx="10" fill="#1E1B4B" stroke="#6366F1" stroke-width="1.5"/>
      <text x="20" y="28" fill="#C7D2FE" font-size="14" font-weight="800">DEGREE OF A NODE</text>
      <text x="20" y="52" fill="#EEF2FF" font-size="13">Number of children a node has.</text>
      <text x="20" y="72" fill="#C7D2FE" font-size="12">Degree of B = 2 (Children: D, E)</text>
    </g>

    <g transform="translate(85, 410)">
      <rect width="330" height="75" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1"/>
      <text x="20" y="28" fill="#F8FAFC" font-size="13" font-weight="700">Degree of Leaves:</text>
      <text x="20" y="50" fill="#94A3B8" font-size="12">Every leaf node has Degree = 0.</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

    {edge(820, 220, 680, 340, '#818CF8', 3)}
    {edge(820, 220, 960, 340, '#818CF8', 3)}
    {edge(680, 340, 600, 470, '#10B981', 3.5)}
    {edge(680, 340, 760, 470, '#10B981', 3.5)}

    {node(820, 220, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(680, 340, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(960, 340, 'C', 'url(#leafGrad)', '#A7F3D0')}
    {node(600, 470, 'D', 'url(#leafGrad)', '#A7F3D0')}
    {node(760, 470, 'E', 'url(#leafGrad)', '#A7F3D0')}

    {callout(820, 165, 'Degree(A) = 2', '#3B0764', '#A855F7', '#F5D0FE')}
    {callout(560, 340, 'Degree(B) = 2', '#1E3A8A', '#3B82F6', '#DBEAFE', (650, 340))}
    {callout(1070, 340, 'LEAF: Degree(C) = 0', '#064E3B', '#10B981', '#D1FAE5', (990, 340))}
    {callout(680, 540, 'LEAF NODES: Degree(D)=0, Degree(E)=0', '#064E3B', '#10B981', '#D1FAE5')}
  </g>
"""
scenes.append((
    s4_content,
    "04. Leaf Nodes & Degree",
    "A leaf node has zero children; a node's degree is its count of children",
    "A node with no children is a leaf. A node's degree is its number of children.",
    "PART 2: TERMINOLOGY",
    6.5
))

# Scene 5: Level, Depth, Height, Subtree (26.5s - 33.0s, duration: 6.5s)
s5_content = f"""
  <g>
    <rect x="60" y="130" width="380" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <text x="85" y="170" fill="#FFFFFF" font-size="20" font-weight="800">Tree Metrics</text>

    <g transform="translate(85, 200)">
      <rect width="330" height="55" rx="8" fill="#1E1B4B" stroke="#6366F1" stroke-width="1"/>
      <text x="15" y="24" fill="#C7D2FE" font-size="13" font-weight="800">LEVEL:</text>
      <text x="15" y="44" fill="#94A3B8" font-size="12">Root = Level 0; Children = Level 1, 2...</text>
    </g>

    <g transform="translate(85, 265)">
      <rect width="330" height="55" rx="8" fill="#3B0764" stroke="#A855F7" stroke-width="1"/>
      <text x="15" y="24" fill="#F0ABFC" font-size="13" font-weight="800">DEPTH:</text>
      <text x="15" y="44" fill="#94A3B8" font-size="12">Number of edges from Root to that node</text>
    </g>

    <g transform="translate(85, 330)">
      <rect width="330" height="55" rx="8" fill="#0C4A6E" stroke="#0284C7" stroke-width="1"/>
      <text x="15" y="24" fill="#7DD3FC" font-size="13" font-weight="800">HEIGHT:</text>
      <text x="15" y="44" fill="#94A3B8" font-size="12">Longest downward path to a leaf (Height = 2)</text>
    </g>

    <g transform="translate(85, 395)">
      <rect width="330" height="55" rx="8" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
      <text x="15" y="24" fill="#A7F3D0" font-size="13" font-weight="800">SUBTREE:</text>
      <text x="15" y="44" fill="#94A3B8" font-size="12">A node and all of its descendants</text>
    </g>
  </g>

  <g>
    <rect x="480" y="130" width="740" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>

    <line x1="500" y1="220" x2="1140" y2="220" stroke="#334155" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="1150" y="225" fill="#94A3B8" font-size="11" font-weight="700">LEVEL 0</text>

    <line x1="500" y1="340" x2="1140" y2="340" stroke="#334155" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="1150" y="345" fill="#94A3B8" font-size="11" font-weight="700">LEVEL 1</text>

    <line x1="500" y1="470" x2="1140" y2="470" stroke="#334155" stroke-dasharray="4,4" stroke-width="1"/>
    <text x="1150" y="475" fill="#94A3B8" font-size="11" font-weight="700">LEVEL 2</text>

    <!-- Subtree Outline -->
    <rect x="560" y="295" width="280" height="230" rx="16" fill="#6366F1" fill-opacity="0.08" stroke="#818CF8" stroke-width="1.5" stroke-dasharray="5,5"/>
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

    {callout(820, 165, 'Root: Depth = 0', '#3B0764', '#A855F7', '#F5D0FE')}
    {callout(570, 400, 'Depth(D) = 2', '#1E3A8A', '#3B82F6', '#DBEAFE')}
    {callout(1050, 400, 'Tree Height = 2', '#0C4A6E', '#0284C7', '#BAE6FD')}
  </g>
"""
scenes.append((
    s5_content,
    "05. Level, Depth, Height & Subtrees",
    "Measuring distances in tree hierarchies systematically",
    "A node and its descendants form a subtree.",
    "PART 2: TERMINOLOGY",
    6.5
))

# Scene 6: Types of Trees Overview (33.0s - 39.5s, duration: 6.5s)
s6_content = f"""
  <g>
    <!-- Card 1: GENERAL TREE -->
    <rect x="60" y="130" width="560" height="460" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5"/>
    <rect x="85" y="155" width="160" height="28" rx="6" fill="#1E3A8A" stroke="#2563EB" stroke-width="1"/>
    <text x="165" y="174" fill="#93C5FD" font-size="12" font-weight="800" text-anchor="middle">TYPE 1 • GENERAL</text>
    <text x="85" y="215" fill="#FFFFFF" font-size="22" font-weight="800">General Tree</text>
    <text x="85" y="240" fill="#94A3B8" font-size="14">A node can have ANY number of children</text>

    {edge(340, 290, 200, 400, '#64748B', 3)}
    {edge(340, 290, 340, 400, '#64748B', 3)}
    {edge(340, 290, 480, 400, '#64748B', 3)}
    {node(340, 290, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(200, 400, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(340, 400, 'C', 'url(#parentGrad)', '#BFDBFE')}
    {node(480, 400, 'D', 'url(#parentGrad)', '#BFDBFE')}

    {callout(340, 480, 'No limit: 3, 4, 5+ branches per node', '#1E293B', '#64748B', '#E2E8F0')}

    <!-- Card 2: BINARY TREE -->
    <rect x="660" y="130" width="560" height="460" rx="16" fill="url(#cardGrad)" stroke="#6366F1" stroke-width="2"/>
    <rect x="685" y="155" width="160" height="28" rx="6" fill="#312E81" stroke="#6366F1" stroke-width="1"/>
    <text x="765" y="174" fill="#C7D2FE" font-size="12" font-weight="800" text-anchor="middle">TYPE 2 • BINARY</text>
    <text x="685" y="215" fill="#FFFFFF" font-size="22" font-weight="800">Binary Tree</text>
    <text x="685" y="240" fill="#94A3B8" font-size="14">Each node has AT MOST 2 children (Left &amp; Right)</text>

    {edge(940, 290, 840, 400, '#818CF8', 3.5)}
    {edge(940, 290, 1040, 400, '#818CF8', 3.5)}
    {node(940, 290, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(840, 400, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(1040, 400, 'C', 'url(#parentGrad)', '#BFDBFE')}

    {callout(840, 480, 'Left Child', '#1E3A8A', '#3B82F6', '#DBEAFE')}
    {callout(1040, 480, 'Right Child', '#064E3B', '#10B981', '#D1FAE5')}
  </g>
"""
scenes.append((
    s6_content,
    "06. General Tree vs. Binary Tree",
    "General trees allow arbitrary branching; Binary trees limit children to at most 2",
    "There are 3 basic types of trees. A general tree can have any number of children. A binary tree has at most 2 children, left and right.",
    "PART 3: TREE TYPES",
    6.5
))

# Scene 7: Binary Search Tree (BST) (39.5s - 44.5s, duration: 5.0s)
s7_content = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#10B981" stroke-width="2"/>

    <rect x="85" y="155" width="220" height="28" rx="6" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
    <text x="195" y="174" fill="#A7F3D0" font-size="12" font-weight="800" text-anchor="middle">TYPE 3 • BINARY SEARCH TREE</text>

    <text x="85" y="215" fill="#FFFFFF" font-size="24" font-weight="800">Binary Search Tree (BST)</text>
    <text x="85" y="240" fill="#34D399" font-size="15" font-weight="600">The Golden Invariant: Left Child &lt; Parent &lt; Right Child</text>

    <!-- Large BST Diagram -->
    {edge(640, 270, 460, 370, '#38BDF8', 4)}
    {edge(640, 270, 820, 370, '#34D399', 4)}
    {edge(460, 370, 370, 470, '#38BDF8', 3.5)}
    {edge(460, 370, 550, 470, '#38BDF8', 3.5)}
    {edge(820, 370, 730, 470, '#34D399', 3.5)}
    {edge(820, 370, 910, 470, '#34D399', 3.5)}

    {node(640, 270, '50', 'url(#rootGrad)', '#DDD6FE')}
    {node(460, 370, '30', 'url(#parentGrad)', '#BFDBFE')}
    {node(820, 370, '70', 'url(#parentGrad)', '#BFDBFE')}
    {node(370, 470, '20', 'url(#leafGrad)', '#A7F3D0')}
    {node(550, 470, '40', 'url(#leafGrad)', '#A7F3D0')}
    {node(730, 470, '60', 'url(#leafGrad)', '#A7F3D0')}
    {node(910, 470, '80', 'url(#leafGrad)', '#A7F3D0')}

    {callout(640, 205, 'ROOT [50]', '#3B0764', '#A855F7', '#F5D0FE')}
    {callout(350, 320, 'LEFT &lt; 50 (Smaller Values)', '#0C4A6E', '#0284C7', '#BAE6FD')}
    {callout(930, 320, 'RIGHT &gt; 50 (Greater Values)', '#064E3B', '#10B981', '#D1FAE5')}
    {callout(640, 545, 'Inorder Traversal visits BST in Sorted Ascending Order: 20, 30, 40, 50, 60, 70, 80', '#0F172A', '#34D399', '#ECFDF5')}
  </g>
"""
scenes.append((
    s7_content,
    "07. Binary Search Tree (BST)",
    "Values on left are smaller; values on right are greater",
    "In a BST, smaller values go left, and greater values go right. These are the basic tree types.",
    "PART 3: TREE TYPES",
    5.0
))

# Scene 8: 5 Types of Binary Trees Intro & Strictly Binary (44.5s - 52.0s, duration: 7.5s)
s8_content = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#8B5CF6" stroke-width="2"/>

    <rect x="85" y="155" width="220" height="28" rx="6" fill="#3B0764" stroke="#A855F7" stroke-width="1"/>
    <text x="195" y="174" fill="#F0ABFC" font-size="12" font-weight="800" text-anchor="middle">5 BINARY TREE TYPES</text>

    <text x="85" y="215" fill="#FFFFFF" font-size="24" font-weight="800">1. Strictly Binary Tree</text>
    <text x="85" y="240" fill="#C4B5FD" font-size="15" font-weight="600">Every node has EITHER 0 OR 2 CHILDREN (No node has 1 child)</text>

    {edge(640, 290, 500, 390, '#818CF8', 3.5)}
    {edge(640, 290, 780, 390, '#818CF8', 3.5)}
    {edge(500, 390, 420, 490, '#818CF8', 3.5)}
    {edge(500, 390, 580, 490, '#818CF8', 3.5)}

    {node(640, 290, '10', 'url(#rootGrad)', '#DDD6FE')}
    {node(500, 390, '5', 'url(#parentGrad)', '#BFDBFE')}
    {node(780, 390, '15', 'url(#leafGrad)', '#A7F3D0')}
    {node(420, 490, '2', 'url(#leafGrad)', '#A7F3D0')}
    {node(580, 490, '7', 'url(#leafGrad)', '#A7F3D0')}

    {callout(780, 440, 'Node 15 has 0 children (Leaf)', '#064E3B', '#10B981', '#D1FAE5')}
    {callout(500, 545, 'Node 5 has 2 children (2 &amp; 7)', '#1E3A8A', '#3B82F6', '#DBEAFE')}
    {callout(640, 230, 'Root 10 has 2 children (5 &amp; 15)', '#3B0764', '#A855F7', '#F5D0FE')}
    {callout(1020, 390, 'STRICT RULE: 0 or 2 Children only', '#312E81', '#818CF8', '#EEF2FF')}
  </g>
"""
scenes.append((
    s8_content,
    "08. Strictly Binary Tree",
    "Every node has either 0 or 2 children — strictly no 1-child nodes",
    "Let's learn 5 types of binary trees. A strictly binary tree has either 0 or 2 children.",
    "PART 4: BINARY TREE TYPES",
    7.5
))

# Scene 9: Full Binary Tree (52.0s - 56.5s, duration: 4.5s)
s9_content = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#3B82F6" stroke-width="2"/>

    <rect x="85" y="155" width="200" height="28" rx="6" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1"/>
    <text x="185" y="174" fill="#BFDBFE" font-size="12" font-weight="800" text-anchor="middle">2. FULL BINARY TREE</text>

    <text x="85" y="215" fill="#FFFFFF" font-size="24" font-weight="800">Full Binary Tree</text>
    <text x="85" y="240" fill="#93C5FD" font-size="15" font-weight="600">All internal nodes have 2 children, and all leaves are at the bottom level</text>

    {edge(640, 280, 480, 370, '#60A5FA', 3.5)}
    {edge(640, 280, 800, 370, '#60A5FA', 3.5)}
    {edge(480, 370, 400, 470, '#60A5FA', 3)}
    {edge(480, 370, 560, 470, '#60A5FA', 3)}
    {edge(800, 370, 720, 470, '#60A5FA', 3)}
    {edge(800, 370, 880, 470, '#60A5FA', 3)}

    {node(640, 280, '40', 'url(#rootGrad)', '#DDD6FE')}
    {node(480, 370, '20', 'url(#parentGrad)', '#BFDBFE')}
    {node(800, 370, '60', 'url(#parentGrad)', '#BFDBFE')}
    {node(400, 470, '10', 'url(#leafGrad)', '#A7F3D0')}
    {node(560, 470, '30', 'url(#leafGrad)', '#A7F3D0')}
    {node(720, 470, '50', 'url(#leafGrad)', '#A7F3D0')}
    {node(880, 470, '70', 'url(#leafGrad)', '#A7F3D0')}

    {callout(640, 225, 'Internal Node 40: 2 Children', '#3B0764', '#A855F7', '#F5D0FE')}
    {callout(640, 545, 'All Leaves (10, 30, 50, 70) at identical lowest level', '#064E3B', '#10B981', '#D1FAE5')}
    {callout(1070, 370, 'Fully Balanced Symmetrical Tree', '#1E3A8A', '#3B82F6', '#DBEAFE')}
  </g>
"""
scenes.append((
    s9_content,
    "09. Full Binary Tree",
    "All internal nodes have 2 children; all leaves reside at the same bottom level",
    "Full binary tree.",
    "PART 4: BINARY TREE TYPES",
    4.5
))

# Scene 10: Complete Binary Tree (56.5s - 61.0s, duration: 4.5s)
s10_content = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#10B981" stroke-width="2"/>

    <rect x="85" y="155" width="220" height="28" rx="6" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
    <text x="195" y="174" fill="#A7F3D0" font-size="12" font-weight="800" text-anchor="middle">3. COMPLETE BINARY</text>

    <text x="85" y="215" fill="#FFFFFF" font-size="24" font-weight="800">Complete Binary Tree</text>
    <text x="85" y="240" fill="#34D399" font-size="15" font-weight="600">All levels filled completely, except possibly the last level (filled strictly Left-to-Right)</text>

    {edge(640, 280, 480, 370, '#34D399', 3.5)}
    {edge(640, 280, 800, 370, '#34D399', 3.5)}
    {edge(480, 370, 400, 470, '#34D399', 3)}
    {edge(480, 370, 560, 470, '#34D399', 3)}
    {edge(800, 370, 720, 470, '#34D399', 3)}

    {node(640, 280, '25', 'url(#rootGrad)', '#DDD6FE')}
    {node(480, 370, '15', 'url(#parentGrad)', '#BFDBFE')}
    {node(800, 370, '35', 'url(#parentGrad)', '#BFDBFE')}
    {node(400, 470, '10', 'url(#leafGrad)', '#A7F3D0')}
    {node(560, 470, '20', 'url(#leafGrad)', '#A7F3D0')}
    {node(720, 470, '30', 'url(#leafGrad)', '#A7F3D0')}

    {callout(560, 545, 'Bottom level nodes added strictly Left-to-Right without gaps', '#064E3B', '#10B981', '#D1FAE5')}
    {callout(1050, 370, 'Standard structure for Binary Heaps', '#0C4A6E', '#0284C7', '#BAE6FD')}
  </g>
"""
scenes.append((
    s10_content,
    "10. Complete Binary Tree",
    "All levels filled completely; bottom level filled left-to-right without gaps",
    "Complete binary tree.",
    "PART 4: BINARY TREE TYPES",
    4.5
))

# Scene 11: Perfect Binary Tree (61.0s - 66.0s, duration: 5.0s)
s11_content = f"""
  <g>
    <rect x="60" y="130" width="1160" height="460" rx="16" fill="url(#cardGrad)" stroke="#F59E0B" stroke-width="2"/>

    <rect x="85" y="155" width="220" height="28" rx="6" fill="#451A03" stroke="#F59E0B" stroke-width="1"/>
    <text x="195" y="174" fill="#FDE68A" font-size="12" font-weight="800" text-anchor="middle">4. PERFECT BINARY</text>

    <text x="85" y="215" fill="#FFFFFF" font-size="24" font-weight="800">Perfect Binary Tree</text>
    <text x="85" y="240" fill="#FBBF24" font-size="15" font-weight="600">Every internal node has 2 children, and all leaves are at the exact same depth</text>

    {edge(640, 280, 480, 370, '#FBBF24', 3.5)}
    {edge(640, 280, 800, 370, '#FBBF24', 3.5)}
    {edge(480, 370, 400, 470, '#FBBF24', 3)}
    {edge(480, 370, 560, 470, '#FBBF24', 3)}
    {edge(800, 370, 720, 470, '#FBBF24', 3)}
    {edge(800, 370, 880, 470, '#FBBF24', 3)}

    {node(640, 280, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(480, 370, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(800, 370, 'C', 'url(#parentGrad)', '#BFDBFE')}
    {node(400, 470, 'D', 'url(#leafGrad)', '#A7F3D0')}
    {node(560, 470, 'E', 'url(#leafGrad)', '#A7F3D0')}
    {node(720, 470, 'F', 'url(#leafGrad)', '#A7F3D0')}
    {node(880, 470, 'G', 'url(#leafGrad)', '#A7F3D0')}

    {callout(640, 545, 'Total Nodes = 2^(h+1) - 1 = 7 nodes (Completely saturated)', '#78350F', '#F59E0B', '#FEF3C7')}
    {callout(1060, 370, 'All leaves (D, E, F, G) at level 2', '#451A03', '#F59E0B', '#FEF3C7')}
  </g>
"""
scenes.append((
    s11_content,
    "11. Perfect Binary Tree",
    "All internal nodes have 2 children; all leaves at the same level",
    "A perfect binary tree has two children at every internal node, and all leaves are at the same level.",
    "PART 4: BINARY TREE TYPES",
    5.0
))

# Scene 12: Degenerate Tree & Grand Summary (66.0s - 75.36s, duration: 9.36s)
s12_content = f"""
  <g>
    <!-- Degenerate Diagram -->
    <rect x="60" y="130" width="460" height="460" rx="16" fill="url(#cardGrad)" stroke="#EF4444" stroke-width="2"/>
    <rect x="85" y="155" width="220" height="28" rx="6" fill="#450A0A" stroke="#EF4444" stroke-width="1.5"/>
    <text x="195" y="174" fill="#FCA5A5" font-size="12" font-weight="800" text-anchor="middle">5. DEGENERATE TREE</text>

    <text x="85" y="215" fill="#FFFFFF" font-size="22" font-weight="800">Degenerate (Skewed) Tree</text>
    <text x="85" y="240" fill="#F87171" font-size="14" font-weight="600">Every node has ONLY ONE child</text>

    {edge(180, 290, 240, 345, '#F87171', 3.5)}
    {edge(240, 345, 300, 400, '#F87171', 3.5)}
    {edge(300, 400, 360, 455, '#F87171', 3.5)}
    {edge(360, 455, 420, 510, '#F87171', 3.5)}

    {node(180, 290, 'A', 'url(#rootGrad)', '#DDD6FE')}
    {node(240, 345, 'B', 'url(#parentGrad)', '#BFDBFE')}
    {node(300, 400, 'C', 'url(#parentGrad)', '#BFDBFE')}
    {node(360, 455, 'D', 'url(#parentGrad)', '#BFDBFE')}
    {node(420, 510, 'E', 'url(#leafGrad)', '#A7F3D0')}

    {callout(280, 550, 'Functions like a Linked List: O(N) operations', '#450A0A', '#EF4444', '#FEE2E2')}

    <!-- Taxonomy Summary Table -->
    <rect x="550" y="130" width="670" height="460" rx="16" fill="url(#cardGrad)" stroke="#6366F1" stroke-width="2"/>
    <text x="580" y="170" fill="#FFFFFF" font-size="22" font-weight="800">Binary Tree Classification Summary</text>

    <g transform="translate(580, 195)">
      <rect width="610" height="50" rx="10" fill="#1E1B4B" stroke="#6366F1" stroke-width="1"/>
      <text x="20" y="30" fill="#A5B4FC" font-size="14" font-weight="800">1. Strictly Binary</text>
      <text x="200" y="30" fill="#E0E7FF" font-size="13">Every node has either 0 or 2 children</text>
    </g>

    <g transform="translate(580, 255)">
      <rect width="610" height="50" rx="10" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1"/>
      <text x="20" y="30" fill="#93C5FD" font-size="14" font-weight="800">2. Full Binary</text>
      <text x="200" y="30" fill="#E0F2FE" font-size="13">All internal nodes have 2 children, all leaves at depth</text>
    </g>

    <g transform="translate(580, 315)">
      <rect width="610" height="50" rx="10" fill="#064E3B" stroke="#10B981" stroke-width="1"/>
      <text x="20" y="30" fill="#6EE7B7" font-size="14" font-weight="800">3. Complete Binary</text>
      <text x="200" y="30" fill="#ECFDF5" font-size="13">All levels full except last; filled left to right</text>
    </g>

    <g transform="translate(580, 375)">
      <rect width="610" height="50" rx="10" fill="#451A03" stroke="#F59E0B" stroke-width="1"/>
      <text x="20" y="30" fill="#FDE68A" font-size="14" font-weight="800">4. Perfect Binary</text>
      <text x="200" y="30" fill="#FFFBEB" font-size="13">Saturated triangle; exactly 2^(h+1) - 1 nodes</text>
    </g>

    <g transform="translate(580, 435)">
      <rect width="610" height="50" rx="10" fill="#450A0A" stroke="#EF4444" stroke-width="1"/>
      <text x="20" y="30" fill="#FCA5A5" font-size="14" font-weight="800">5. Degenerate</text>
      <text x="200" y="30" fill="#FEF2F2" font-size="13">Every parent has 1 child; linear chain</text>
    </g>

    <g transform="translate(580, 500)">
      <rect width="610" height="42" rx="10" fill="#0F172A" stroke="#334155" stroke-width="1"/>
      <text x="305" y="26" fill="#38BDF8" font-size="13" font-weight="700" text-anchor="middle">✓ Tree Masterclass Complete — Zero Overlaps &amp; Clear Visuals</text>
    </g>
  </g>
"""
scenes.append((
    s12_content,
    "12. Degenerate Tree & Summary",
    "Degenerate binary tree has one child per node; all 5 binary tree types reviewed",
    "Degenerate binary tree: one child per node. These are the main types of binary trees.",
    "PART 4: SUMMARY",
    9.36
))

print(f"Generating and validating {len(scenes)} scenes...")

concat_lines = []

for idx, (content, title, subtitle, narration, part_tag, duration) in enumerate(scenes, start=1):
    svg_str = make_svg(content, title, subtitle, narration, part_tag)
    svg_file = f"{SCENES_DIR}/scene_{idx:02d}.svg"
    png_file = f"{SCENES_DIR}/scene_{idx:02d}.png"
    
    with open(svg_file, "w") as f:
        f.write(svg_str)
        
    # Validate with ElementTree
    try:
        ET.fromstring(svg_str)
    except Exception as e:
        print(f"Error in scene {idx}: {e}")
        raise e
        
    # Convert to PNG with ffmpeg
    cmd = f"ffmpeg -y -i {svg_file} {png_file}"
    subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Scene {idx:02d} rendered ({duration}s): {title}")
    
    concat_lines.append(f"file '{png_file}'")
    concat_lines.append(f"duration {duration:.2f}")

# Concat requires repeating the last file
concat_lines.append(concat_lines[-2])

concat_txt = f"{SCENES_DIR}/concat.txt"
with open(concat_txt, "w") as f:
    f.write("\n".join(concat_lines) + "\n")

print("Building video with ffmpeg...")
final_video = "/tmp/final_lesson.mp4"
build_cmd = (
    f"ffmpeg -y -f concat -safe 0 -i {concat_txt} "
    f"-i /tmp/voiceover.aac "
    f"-c:v libx264 -pix_fmt yuv420p -r 25 -preset medium -crf 20 "
    f"-c:a aac -b:a 128k -shortest "
    f"{final_video}"
)
subprocess.run(build_cmd, shell=True, check=True)

print("Final video successfully rendered at", final_video)
