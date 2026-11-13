"""Assemble the 9x9 line-ink hand sheet + posters from the per-pose clips. usage: python3 -I build.py outdir"""
import sys, glob, os
from PIL import Image, ImageFilter
import numpy as np
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
P = ['wave','thumbsUp','ok','pointRight','pointDown','peace','three','palm','fist']
INK = (39, 61, 53); S = 960; CELL = 144
def alpha(path):
    im = Image.open(path).convert('L'); w, h = im.size; s = min(w, h)
    im = im.crop(((w-s)//2, (h-s)//2, (w+s)//2, (h+s)//2)).resize((S, S), Image.LANCZOS)
    g = np.asarray(im).astype(np.float32)
    bg = max(np.median(np.concatenate([g[:12].ravel(), g[-12:].ravel(), g[:, :12].ravel(), g[:, -12:].ravel()])), np.percentile(g, 90))
    a = np.clip((bg - 10 - g) / max(bg - 10 - 95, 1), 0, 1) ** 0.75
    yy, xx = np.mgrid[0:S, 0:S]; a *= np.clip(np.minimum.reduce([xx, yy, S-1-xx, S-1-yy]) / (S * 0.06), 0, 1)
    top = np.percentile(a[a > 0.05], 97) if (a > 0.05).sum() > 50 else 1
    a = np.clip(a / max(top, 0.3), 0, 1)
    # heavier line so it holds at 48px: grow the ink a few pixels, then soften
    im = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.GaussianBlur(1.2))
    return np.asarray(im).astype(np.float32) / 255
rows = []
for p in P:
    idx = [int(x) for x in open(f'fr/{p}/idx.txt').read().split()]
    raw = sorted(glob.glob(f'fr/{p}/raw*.png'))
    rows.append([alpha('stills/hub.webp')] + [alpha(raw[i]) for i in idx[1:8]] + [alpha(f'stills/{p}.webp')])
m = np.maximum.reduce([f for r in rows for f in r]) > 0.25
ys, xs = np.where(m); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
side = int(max(x1 - x0, y1 - y0) * 1.06); cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
box = (cx - side//2, cy - side//2, cx - side//2 + side, cy - side//2 + side)
print('bbox', x0, x1, y0, y1, 'box', box)
def cell(a):
    rgba = np.dstack([np.full_like(a, INK[0]), np.full_like(a, INK[1]), np.full_like(a, INK[2]), a * 255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA').crop(box).resize((CELL, CELL), Image.LANCZOS)
sheet = Image.new('RGBA', (9*CELL, 9*CELL), (0, 0, 0, 0))
for r, p in enumerate(P):
    for c in range(9):
        im = cell(rows[r][c]); sheet.paste(im, (c*CELL, r*CELL))
        if c == 8: im.save(f'{out}/poster-{p}.webp', quality=85, method=6)
sheet.save(f'{out}/sheet.webp', quality=72, method=6, alpha_quality=80)
cs = Image.new('RGB', sheet.size, (247, 242, 231)); cs.paste(sheet, (0, 0), sheet); cs.resize((1152, 1152), Image.LANCZOS).save(f'{out}/contact-sheet.png')
# small-size preview: light + dark at 56px (2x)
pv = Image.new('RGB', (9*120, 240), (247, 242, 231)); pv.paste((30, 46, 40), (0, 120, 9*120, 240))
for r in range(9):
    im = sheet.crop((8*CELL, r*CELL, 9*CELL, (r+1)*CELL)).resize((56, 56), Image.LANCZOS)
    pv.paste(im, (r*120+32, 32), im)
    w = Image.merge('RGBA', [Image.new('L', im.size, v) for v in (240, 232, 214)] + [im.split()[3]]); pv.paste(w, (r*120+32, 152), w)
pv.resize((pv.width*2, pv.height*2), Image.NEAREST).save(f'{out}/small.png')
for f in ['sheet.webp'] + [f'poster-{p}.webp' for p in P]: print(f, os.path.getsize(f'{out}/{f}'))
