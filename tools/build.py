#!/usr/bin/env python3
"""Gera o ficheiro único `dist/torneio-udcsb.html`.

O ficheiro resultante não depende de servidor nem de rede: CSS, JavaScript, fonte
e emblemas ficam embutidos. É esse que se guarda no telemóvel para usar no campo.

Uso:  python3 tools/build.py
"""
from pathlib import Path
import base64
import hashlib
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DIST = ROOT / "dist"


def data_url(path: Path, mime: str) -> str:
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def main() -> int:
    html = (SRC / "index.html").read_text(encoding="utf-8")

    # CSS
    css = (SRC / "css" / "styles.css").read_text(encoding="utf-8")
    html = html.replace(
        '<link rel="stylesheet" href="css/styles.css">',
        "<style>\n" + css + "\n</style>")

    # JavaScript, pela ordem declarada no index
    scripts = re.findall(r'<script src="([^"]+)"></script>', html)
    if not scripts:
        sys.exit("Não encontrei os <script src> no index.html")
    bundle = []
    for rel in scripts:
        path = SRC / rel
        if not path.exists():
            sys.exit(f"Ficheiro em falta: {path}")
        bundle.append(f"/* ===== {rel} ===== */\n" + path.read_text(encoding="utf-8"))

    # Fonte e emblemas como data URLs, antes do resto do código
    font = data_url(SRC / "assets" / "fonts" / "BebasNeue-Regular.ttf", "font/ttf")
    logos_dir = SRC / "assets" / "logos"
    inline = ["window.App = window.App || {};",
              "window.App.ASSETS = { font: '%s' };" % font,
              "window.App.__INLINE_LOGOS = {"]
    for png in sorted(logos_dir.glob("*.png")):
        inline.append("  '%s': '%s'," % (png.stem, data_url(png, "image/png")))
    inline.append("};")
    # Depois de logos.data.js correr, junta o src a cada emblema.
    patch = (
        "(function (App) {\n"
        "  Object.keys(App.__INLINE_LOGOS).forEach(function (k) {\n"
        "    if (App.LOGOS[k]) App.LOGOS[k].src = App.__INLINE_LOGOS[k];\n"
        "  });\n"
        "}(window.App));"
    )

    js = "\n".join(inline) + "\n\n" + "\n\n".join(bundle[:2]) + "\n\n" + patch + "\n\n" + "\n\n".join(bundle[2:])

    first = f'<script src="{scripts[0]}"></script>'
    html = html.replace(first, "<script>\n" + js + "\n</script>", 1)
    for rel in scripts[1:]:
        html = html.replace(f'<script src="{rel}"></script>\n', "")
        html = html.replace(f'<script src="{rel}"></script>', "")

    DIST.mkdir(parents=True, exist_ok=True)
    index = DIST / "index.html"
    index.write_text(html, encoding="utf-8")

    # O service worker leva um hash do build no nome da cache, para que uma
    # versão nova não fique presa atrás da antiga.
    version = hashlib.sha1(html.encode("utf-8")).hexdigest()[:10]
    sw = (SRC / "sw.js").read_text(encoding="utf-8").replace("__CACHE_VERSION__", version)
    (DIST / "sw.js").write_text(sw, encoding="utf-8")

    shutil.copy2(SRC / "manifest.webmanifest", DIST / "manifest.webmanifest")
    icons_out = DIST / "assets" / "icons"
    icons_out.mkdir(parents=True, exist_ok=True)
    for icon in (SRC / "assets" / "icons").glob("*.png"):
        shutil.copy2(icon, icons_out / icon.name)

    print(f"dist/index.html  —  {len(html) / 1024:.0f} KB  (cache {version})")
    print("dist/ pronto para GitHub Pages ou para guardar no telemóvel.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
