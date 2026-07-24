#!/usr/bin/env python3
"""Gera os ícones da aplicação a partir do emblema do clube.

Serve para o atalho no ecrã inicial do telemóvel ficar com o emblema em vez de
uma miniatura da página.

Uso:  python3 tools/make_icons.py
"""
from pathlib import Path
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Requer Pillow:  pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
CREST = ROOT / "src" / "assets" / "logos" / "udcsb.png"
OUT = ROOT / "src" / "assets" / "icons"

NAVY = (5, 22, 54, 255)
SIZES = {"icon-192.png": 192, "icon-512.png": 512, "apple-touch-icon.png": 180}


def main() -> int:
    if not CREST.exists():
        sys.exit("Corre primeiro tools/prepare_logos.py")
    crest = Image.open(CREST).convert("RGBA")
    OUT.mkdir(parents=True, exist_ok=True)

    for name, size in SIZES.items():
        canvas = Image.new("RGBA", (size, size), NAVY)
        inner = int(size * 0.74)          # margem para o ícone não encostar às bordas
        ratio = min(inner / crest.width, inner / crest.height)
        logo = crest.resize((max(1, round(crest.width * ratio)),
                             max(1, round(crest.height * ratio))), Image.LANCZOS)
        canvas.alpha_composite(logo, ((size - logo.width) // 2, (size - logo.height) // 2))
        canvas.convert("RGB").save(OUT / name, optimize=True)
        print(f"  {name:22s} {size}x{size}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
