#!/usr/bin/env python3
"""Hojas de contacto reducidas por viewport. Uso: python3 -I hoja_contacto.py <carpeta capturas> <viewport> <salida.png> [ancho_miniatura] [columnas] [alto_max_relativo]"""
import sys, glob, os
from PIL import Image, ImageDraw
src, vp, out = sys.argv[1:4]
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 200
cols = int(sys.argv[5]) if len(sys.argv) > 5 else 8
rel = float(sys.argv[6]) if len(sys.argv) > 6 else 2.0
files = sorted(glob.glob(os.path.join(src, f'atlas_*_{vp}.png')))
orden = ['portada', 'portada-bloque', 'entrada']
files.sort(key=lambda f: (orden.index(os.path.basename(f)[6:-len(vp) - 5]) if os.path.basename(f)[6:-len(vp) - 5] in orden else 9, f))
thumbs = []
for f in files:
    im = Image.open(f).convert('RGB'); w, h = im.size
    im = im.crop((0, 0, w, min(h, int(w * rel))))
    t = im.resize((tw, int(im.size[1] * tw / w)))
    thumbs.append((os.path.basename(f)[6:-len(vp) - 5], t))
th = max(t.size[1] for _, t in thumbs) + 18
rows = (len(thumbs) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 8), rows * th), 'white')
d = ImageDraw.Draw(sheet)
for i, (n, t) in enumerate(thumbs):
    x = (i % cols) * (tw + 8); y = (i // cols) * th
    sheet.paste(t, (x, y + 16)); d.text((x + 2, y + 2), n, fill='black')
sheet.save(out); print(out, sheet.size, len(thumbs))
