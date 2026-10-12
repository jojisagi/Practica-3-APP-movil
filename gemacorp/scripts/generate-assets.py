"""
Genera los recursos gráficos de GemaCorp (gemas facetadas, marcos de poder e iconos)
como SVG y los convierte a PNG con rsvg-convert.

Uso:  python3 scripts/generate-assets.py
Requiere: rsvg-convert (brew install librsvg)
"""
import base64
import math
import os
import subprocess

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG_DIR = os.path.join(RAIZ, "assets", "svg")
GEMAS_DIR = os.path.join(RAIZ, "assets", "gems")
IMG_DIR = os.path.join(RAIZ, "assets", "images")
for d in (SVG_DIR, GEMAS_DIR, IMG_DIR):
    os.makedirs(d, exist_ok=True)

# Cada gema tiene color y FORMA distinta para que se distingan aun sin percibir color
GEMAS = [
    # nombre,     claro,     base,      oscuro,    lados, rotación
    ("rubi",      "#FF8A9A", "#E11D48", "#881337", 6, 0),
    ("zafiro",    "#93C5FD", "#2563EB", "#1E3A8A", 4, 0),
    ("esmeralda", "#86EFAC", "#16A34A", "#14532D", 8, 22.5),
    ("topacio",   "#FDE68A", "#F59E0B", "#92400E", 32, 0),
    ("amatista",  "#D8B4FE", "#9333EA", "#4C1D95", 3, 0),
    ("diamante",  "#E0F2FE", "#38BDF8", "#0E7490", 5, 0),
]


def poligono(cx, cy, r, lados, rot_deg, escala_y=1.0):
    pts = []
    for i in range(lados):
        a = math.radians(rot_deg - 90 + 360 * i / lados)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a) * escala_y))
    return pts


def pts_str(pts):
    return " ".join(f"{x:.2f},{y:.2f}" for x, y in pts)


def mezclar(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(a[i] + (b[i] - a[i]) * t):02X}" for i in range(3))


def svg_gema(nombre, claro, base, oscuro, lados, rot):
    S = 256
    cx, cy = S / 2, S / 2 + 4
    r_ext = 104 if lados != 3 else 118
    if lados == 3:
        cy += 14
    ext = poligono(cx, cy, r_ext, lados, rot)
    tabla = poligono(cx, cy - 6, r_ext * 0.52, lados, rot)
    facetas = []
    # La luz viene de arriba a la izquierda: se sombrea cada faceta según su orientación
    for i in range(lados):
        p1, p2 = ext[i], ext[(i + 1) % lados]
        q1, q2 = tabla[i], tabla[(i + 1) % lados]
        mx, my = (p1[0] + p2[0]) / 2 - cx, (p1[1] + p2[1]) / 2 - cy
        ang = math.atan2(my, mx)
        luz = (math.cos(ang - math.radians(-135)) + 1) / 2  # 1 = de frente a la luz
        if luz > 0.5:
            color = mezclar(base, claro, (luz - 0.5) * 2)
        else:
            color = mezclar(oscuro, base, luz * 2)
        facetas.append(
            f'<polygon points="{pts_str([p1, p2, q2, q1])}" fill="{color}" '
            f'stroke="{oscuro}" stroke-opacity="0.35" stroke-width="2" stroke-linejoin="round"/>'
        )
    brillo_x, brillo_y = tabla[0][0] - r_ext * 0.18, cy - r_ext * 0.32
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">
  <defs>
    <linearGradient id="t" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{claro}"/>
      <stop offset="1" stop-color="{base}"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.35"/>
    </filter>
  </defs>
  <g filter="url(#s)">
    <polygon points="{pts_str(ext)}" fill="{base}" stroke="{oscuro}" stroke-width="6" stroke-linejoin="round"/>
    {''.join(facetas)}
    <polygon points="{pts_str(tabla)}" fill="url(#t)" stroke="{claro}" stroke-width="3" stroke-linejoin="round"/>
  </g>
  <g fill="#FFFFFF">
    <ellipse cx="{brillo_x:.1f}" cy="{brillo_y:.1f}" rx="16" ry="9" opacity="0.85" transform="rotate(-35 {brillo_x:.1f} {brillo_y:.1f})"/>
    <path d="M{cx + r_ext * 0.32:.1f} {cy - r_ext * 0.05:.1f} l5 13 l13 5 l-13 5 l-5 13 l-5 -13 l-13 -5 l13 -5 z" opacity="0.9"/>
  </g>
</svg>"""


def estrella(cx, cy, r_ext, r_int, puntas=5):
    pts = []
    for i in range(puntas * 2):
        r = r_ext if i % 2 == 0 else r_int
        a = math.radians(-90 + 180 * i / puntas)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts_str(pts)


def svg_marco(nombre, c1, c2, c3, insignia):
    """Marco metálico que se dibuja sobre la gema para indicar su nivel de poder."""
    S = 256
    if insignia == "rayo":
        icono = '<path d="M212 182 l-22 34 h16 l-8 26 l26 -36 h-16 l10 -24 z" fill="#FFFFFF" stroke="#334155" stroke-width="3" stroke-linejoin="round"/>'
    else:
        icono = f'<polygon points="{estrella(206, 212, 22, 10)}" fill="#FFFFFF" stroke="#92400E" stroke-width="3" stroke-linejoin="round"/>'
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">
  <defs>
    <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{c1}"/>
      <stop offset="0.5" stop-color="{c2}"/>
      <stop offset="1" stop-color="{c3}"/>
    </linearGradient>
    <radialGradient id="g" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.6" stop-color="{c2}" stop-opacity="0"/>
      <stop offset="1" stop-color="{c2}" stop-opacity="0.55"/>
    </radialGradient>
  </defs>
  <rect x="6" y="6" width="244" height="244" rx="44" fill="url(#g)"/>
  <rect x="10" y="10" width="236" height="236" rx="40" fill="none" stroke="url(#m)" stroke-width="14"/>
  <rect x="20" y="20" width="216" height="216" rx="32" fill="none" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="3"/>
  <circle cx="206" cy="210" r="34" fill="url(#m)" stroke="#FFFFFF" stroke-width="4"/>
  {icono}
</svg>"""


def svg_icono(fondo=True):
    """Icono de la app: tres gemas alineadas (la jugada básica de un Match-3)."""
    S = 1024
    capas = []
    if fondo:
        capas.append(f'<rect width="{S}" height="{S}" fill="#0F2A4A"/>')
        capas.append(f'<rect x="96" y="96" width="832" height="832" rx="180" fill="#14B8A6" opacity="0.18"/>')
    for i, g in enumerate([GEMAS[1], GEMAS[3], GEMAS[0]]):
        x = 112 + i * 272
        y = 384 if i != 1 else 300
        with open(os.path.join(GEMAS_DIR, g[0] + ".png"), "rb") as f:
            datos = base64.b64encode(f.read()).decode()
        capas.append(f'<image href="data:image/png;base64,{datos}" x="{x}" y="{y}" width="256" height="256"/>')
    capas.append('<rect x="160" y="700" width="704" height="40" rx="20" fill="#F59E0B"/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{S}" height="{S}" viewBox="0 0 {S} {S}">{"".join(capas)}</svg>'


def convertir(svg, png, ancho=None):
    cmd = ["rsvg-convert", svg, "-o", png]
    if ancho:
        cmd[1:1] = ["-w", str(ancho)]
    subprocess.run(cmd, check=True)


def guardar(nombre, contenido):
    ruta = os.path.join(SVG_DIR, nombre + ".svg")
    with open(ruta, "w") as f:
        f.write(contenido)
    return ruta


for g in GEMAS:
    convertir(guardar(g[0], svg_gema(*g)), os.path.join(GEMAS_DIR, g[0] + ".png"))

convertir(guardar("marco-plata", svg_marco("plata", "#F8FAFC", "#94A3B8", "#475569", "rayo")),
          os.path.join(GEMAS_DIR, "marco-plata.png"))
convertir(guardar("marco-oro", svg_marco("oro", "#FEF3C7", "#F59E0B", "#B45309", "estrella")),
          os.path.join(GEMAS_DIR, "marco-oro.png"))

convertir(guardar("icono", svg_icono(True)), os.path.join(IMG_DIR, "icon.png"))
convertir(guardar("icono-frente", svg_icono(False)), os.path.join(IMG_DIR, "android-icon-foreground.png"))
convertir(guardar("icono-frente", svg_icono(False)), os.path.join(IMG_DIR, "splash-icon.png"), 512)
convertir(guardar("icono-frente", svg_icono(False)), os.path.join(IMG_DIR, "favicon.png"), 48)
print("Recursos generados en assets/gems y assets/images")
