#!/usr/bin/env python3
"""Generate Shadoi's app icons into public/.

The mark is the app's idea in one shape: a voice wave, with the same wave
trailing behind it as a shadow — shadowing. Colours come from the accent in
src/lib/theme.ts (#14BE64).

Usage:  python3 tools/icon/make_icons.py
Needs:  pip install playwright pillow   (Chromium renders the SVG)
"""
import math
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "icons"
BUILD = pathlib.Path(__file__).parent / ".build"
S = 1024

# Geometry. Fewer sample points keeps the emitted path small; 110 is already
# past the point where more changes the rendering.
SW = 76          # stroke width
POINTS = 110
MAIN_DX, MAIN_DY = -16, -13   # the pair is optically centred, not each half
SHAD_DX, SHAD_DY = 44, 33

LIGHT = dict(
    bg='''<linearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="#25DD7D"/>
      <stop offset="0.55" stop-color="#14BE64"/>
      <stop offset="1" stop-color="#0A8546"/>
    </linearGradient>''',
    shadow="#053A20", shadow_op=".30", main="#FFFFFF")

DARK = dict(
    bg='''<linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="#242D39"/>
      <stop offset="1" stop-color="#11151C"/>
    </linearGradient>''',
    shadow="#14BE64", shadow_op=".34", main="#22D97A")


def wave(x0=190, x1=834, amp=215, cycles=1.5, phase=math.pi, power=0.85,
         cy=S / 2, n=POINTS):
    """One and a half sine cycles under a bell envelope, so it tapers to a
    point at both ends the way a spoken phrase does."""
    pts, w = [], x1 - x0
    for i in range(n + 1):
        u = i / n
        env = math.sin(math.pi * u) ** power
        pts.append((x0 + w * u,
                    cy - amp * env * math.sin(2 * math.pi * cycles * u + phase)))
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(1, len(pts) - 1):
        (px, py), (nx, ny) = pts[i], pts[i + 1]
        d += f"Q{px:.1f},{py:.1f} {(px + nx) / 2:.1f},{(py + ny) / 2:.1f}"
    d += f"L{pts[-1][0]:.1f},{pts[-1][1]:.1f}"
    return d


P = wave()


def svg(theme, rounded=False, bleed=0.0):
    """bleed shrinks the artwork, for maskable icons that get cropped."""
    k = 1 - bleed
    off = S * bleed / 2
    clip = (f'<clipPath id="r"><rect width="{S}" height="{S}" '
            f'rx="{S * 0.2237:.0f}"/></clipPath>') if rounded else ""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}">
<defs>{theme["bg"]}{clip}</defs>
<g{' clip-path="url(#r)"' if rounded else ''}>
<rect width="{S}" height="{S}" fill="url(#bg)"/>
<g transform="translate({off:.0f},{off:.0f}) scale({k})" fill="none" stroke-linecap="round" stroke-linejoin="round">
<path d="{P}" stroke="{theme["shadow"]}" stroke-opacity="{theme["shadow_op"]}" stroke-width="{SW}" transform="translate({SHAD_DX},{SHAD_DY})"/>
<path d="{P}" stroke="{theme["main"]}" stroke-width="{SW}" transform="translate({MAIN_DX},{MAIN_DY})"/>
</g>
</g>
</svg>'''


SOURCES = {  # name -> SVG markup
    "icon": svg(LIGHT),                       # full bleed: iOS masks it itself
    "icon-maskable": svg(LIGHT, bleed=0.20),  # Android adaptive safe zone
    "favicon": svg(LIGHT, rounded=True),      # browser tabs get no mask
    "icon-dark": svg(DARK),                   # alternate, not shipped
}

PNGS = {  # output path -> (source, px)
    ICONS / "apple-touch-icon.png": ("icon", 180),
    ICONS / "apple-touch-icon-152.png": ("icon", 152),
    ICONS / "apple-touch-icon-167.png": ("icon", 167),
    ICONS / "icon-192.png": ("icon", 192),
    ICONS / "icon-512.png": ("icon", 512),
    ICONS / "icon-maskable-512.png": ("icon-maskable", 512),
}


def chromium_path():
    """Use a preinstalled Chromium when one is around (CI images often pin a
    build that Playwright's own downloader would not match); otherwise let
    Playwright resolve its own."""
    env = os.environ.get("SHADOI_CHROMIUM")
    if env:
        return env
    found = sorted(pathlib.Path("/opt/pw-browsers").glob("chromium-*/chrome-linux/chrome"))
    return str(found[-1]) if found else None


def main():
    from playwright.sync_api import sync_playwright
    from PIL import Image

    ICONS.mkdir(parents=True, exist_ok=True)
    BUILD.mkdir(exist_ok=True)
    (ICONS / "icon.svg").write_text(SOURCES["icon"])
    (PUBLIC / "favicon.svg").write_text(SOURCES["favicon"])
    (pathlib.Path(__file__).parent / "icon-dark.svg").write_text(SOURCES["icon-dark"])

    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=chromium_path())
        pg = b.new_page(viewport={"width": S, "height": S}, device_scale_factor=1)
        masters = {}
        for name, body in SOURCES.items():
            pg.set_content("<style>html,body{margin:0;padding:0}svg{display:block}"
                           "</style>" + body)
            out = BUILD / f"{name}.png"
            pg.screenshot(path=str(out), omit_background=True)
            masters[name] = Image.open(out).convert("RGBA")
        b.close()

    for path, (src, size) in PNGS.items():
        # iOS rejects transparency in a home-screen icon, so flatten to RGB.
        masters[src].resize((size, size), Image.LANCZOS).convert("RGB").save(
            path, optimize=True)
    print(f"wrote {len(PNGS)} PNGs + 2 SVGs into {PUBLIC}")


if __name__ == "__main__":
    main()
