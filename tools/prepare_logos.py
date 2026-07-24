#!/usr/bin/env python3
"""Prepara os emblemas para a aplicação.

Lê os ficheiros originais de `assets-src/`, recorta-os ao conteúdo (usando o canal
alpha quando existe, ou uma máscara por limiar quando o fundo é branco), reduz-os
para um tamanho razoável e escreve:

  src/assets/logos/<chave>.png   emblema recortado, com transparência
  src/js/logos.data.js           metadados (dimensões e centro de massa)

O centro de massa serve para a centragem óptica: escudos são pesados em cima e
acabam em bico, por isso centrá-los pela caixa delimitadora deixa-os a parecer
desalinhados dentro do círculo branco.

Uso:  python3 tools/prepare_logos.py
"""
from pathlib import Path
import json
import sys

try:
    from PIL import Image
    import numpy as np
except ImportError:
    sys.exit("Requer Pillow e numpy:  pip install pillow numpy")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
OUT_IMG = ROOT / "src" / "assets" / "logos"
OUT_JS = ROOT / "src" / "js" / "logos.data.js"

MAX_DIM = 340          # os emblemas nunca são desenhados acima de ~290px
WHITE_CUTOFF = 220     # acima disto considera-se fundo branco a recortar

# chave -> ficheiro original
SOURCES = {
    "udcsb": "UDCSB.png",
    "acg": "A_C_Geraldes.jpg",
    "bolhos": "B_F_C_Bolhos.jpg",
    "carm": "Casais_do_Julio.jpg",
    "kopkopos": "KopKopos.png",
    "sce": "S_C_Estrada.png",
}


def load_trimmed(path: Path) -> Image.Image:
    im = Image.open(path)
    has_alpha = "A" in im.getbands() and im.getchannel("A").getextrema()[0] < 250
    if has_alpha:
        im = im.convert("RGBA")
    else:
        im = im.convert("RGB")
        arr = np.array(im).astype(int)
        mask = (arr.min(axis=2) <= WHITE_CUTOFF).astype(np.uint8) * 255
        im = im.convert("RGBA")
        im.putalpha(Image.fromarray(mask, "L"))
    bbox = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    return im.crop(bbox) if bbox else im


def ink_centre(im: Image.Image):
    alpha = np.array(im.getchannel("A"))
    ys, xs = np.nonzero(alpha > 40)
    return float(xs.mean()) / im.width, float(ys.mean()) / im.height


def main() -> int:
    if not SRC.is_dir():
        sys.exit(f"Falta a pasta {SRC} com os emblemas originais.")
    OUT_IMG.mkdir(parents=True, exist_ok=True)

    meta = {}
    for key, filename in SOURCES.items():
        path = SRC / filename
        if not path.exists():
            sys.exit(f"Emblema em falta: {path}")
        im = load_trimmed(path)
        scale = min(MAX_DIM / im.width, MAX_DIM / im.height, 1.0)
        if scale < 1:
            im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
        im.save(OUT_IMG / f"{key}.png", optimize=True)
        inkx, inky = ink_centre(im)
        meta[key] = {"file": f"{key}.png", "w": im.width, "h": im.height,
                     "inkx": round(inkx, 4), "inky": round(inky, 4)}
        print(f"  {key:9s} {im.width:3d}x{im.height:3d}  centro de massa ({inkx:.2f}, {inky:.2f})")

    body = json.dumps(meta, indent=2, ensure_ascii=False)
    OUT_JS.write_text(
        "// GERADO POR tools/prepare_logos.py — não editar à mão.\n"
        "(function (App) {\n  App.LOGOS = " + body.replace("\n", "\n  ") + ";\n"
        "}(window.App = window.App || {}));\n",
        encoding="utf-8")
    print(f"\nEscrito {OUT_JS.relative_to(ROOT)} com {len(meta)} emblemas.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
