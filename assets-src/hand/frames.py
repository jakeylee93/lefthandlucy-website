"""Turn a clip (open hand -> gesture) into 9 line-art frames with a transparent background.
usage: python3 -I frames.py clip.mp4 outdir endstill.png"""
import sys, subprocess, os, glob
from PIL import Image, ImageFilter, ImageChops
import numpy as np
clip, out, end = sys.argv[1:4]; os.makedirs(out, exist_ok=True)
for f in glob.glob(out + '/raw*.png'): os.remove(f)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', clip, out + '/raw%03d.png'], check=True)
raw = sorted(glob.glob(out + '/raw*.png')); n = len(raw)
# ease-out sampling: early frames close together would waste the move; spread evenly then ease slightly
# Sample by how much the drawing has changed, so the nine frames are even steps of the movement
# (the clip holds still at both ends, which plain time-sampling would waste frames on).
small = [np.asarray(Image.open(f).convert('L').resize((96, 96))).astype(np.float32) for f in raw]
step = [0.0] + [float(np.abs(small[i] - small[i - 1]).mean()) for i in range(1, n)]
cum = np.cumsum(step); cum = cum / cum[-1] if cum[-1] > 0 else np.linspace(0, 1, n)
idx = [int(np.searchsorted(cum, t / 8, side='left')) for t in range(9)]; idx = [min(i, n - 1) for i in idx]; idx[0] = 0
INK = (39, 61, 53)  # site charcoal-green text colour
def cut(path, size=256):
    im = Image.open(path).convert('RGB'); w, h = im.size; s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))
    g = np.asarray(im.convert('L')).astype(np.float32)
    bg = np.median(np.concatenate([g[:12].ravel(), g[-12:].ravel(), g[:, :12].ravel(), g[:, -12:].ravel()]))
    bg = max(bg, np.percentile(g, 90))
    a = np.clip((bg - 10 - g) / max(bg - 10 - 95, 1), 0, 1) ** 0.75   # ink darkness -> opacity, lifted so fine lines hold at small size
    # fade lines out near the frame edge so a wrist that reaches the edge ends softly
    yy, xx = np.mgrid[0:s, 0:s]; d = np.minimum.reduce([xx, yy, s - 1 - xx, s - 1 - yy]) / (s * 0.10)
    a *= np.clip(d, 0, 1)
    top = np.percentile(a[a > 0.05], 97) if (a > 0.05).sum() > 50 else 1
    a = np.clip(a / max(top, 0.3), 0, 1)   # every frame reaches full ink strength
    rgba = np.dstack([np.full_like(g, INK[0]), np.full_like(g, INK[1]), np.full_like(g, INK[2]), a * 255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA').resize((size, size), Image.LANCZOS)
frames = [cut(raw[i]) for i in idx]
frames[0] = cut(os.path.dirname(os.path.abspath(end)) + '/hub.webp'); frames[8] = cut(end)            # the last frame is the clean still itself
for i, f in enumerate(frames): f.save(f'{out}/f{i}.png')
open(out + '/idx.txt', 'w').write(' '.join(map(str, idx)))
print(n, 'raw frames; sampled', idx)
