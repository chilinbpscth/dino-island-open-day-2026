"""Approved background removal for the reviewed waking draft only."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

root = Path(__file__).resolve().parents[1]
source = root / 'design/game-assets/drafts/dino-waking-matched-opaque.png'
image = Image.open(source).convert('RGB')
pixels = np.asarray(image).astype('int16')
# The painted grey checkerboard is separated from the black character outline.
neutral = (pixels.max(2)-pixels.min(2) < 25) & (pixels.min(2) > 55) & (pixels.max(2) < 240)
regions = Image.fromarray(neutral.astype('uint8')).copy()
for seed in [(0,0), (338,764), (706,737)]:
    if regions.getpixel(seed) == 1:
        ImageDraw.floodfill(regions, seed, 255, thresh=0)
alpha = Image.fromarray(np.where(np.asarray(regions)==255,0,255).astype('uint8'))
# Remove a single contaminated edge pixel, then soften at subpixel width.
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.4))
rgba = image.convert('RGBA'); rgba.putalpha(alpha)
rgba.thumbnail((940,940),Image.Resampling.LANCZOS)
canvas = Image.new('RGBA',(1024,1024))
canvas.alpha_composite(rgba,((1024-rgba.width)//2,(1024-rgba.height)//2))
output = root / 'hub/img/games/general/dino-waking.png'
canvas.save(output,optimize=True)
review = Image.new('RGBA',canvas.size,'#F6F3EC');review.alpha_composite(canvas)
review.convert('RGB').save(root / 'design/game-assets/drafts/dino-waking-cream-review.png')
print(output)
