"""Remove an approved magenta production matte and make a 1024px RGBA sprite."""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

source_path, target_path, review_path = map(Path, sys.argv[1:])
source = Image.open(source_path).convert('RGB')
pixels = np.asarray(source).astype(int)
matte = (pixels[:, :, 0] - pixels[:, :, 1] > 55) & (pixels[:, :, 2] - pixels[:, :, 1] > 55)
alpha = Image.fromarray(np.where(matte, 0, 255).astype('uint8'))
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.4))
sprite = source.convert('RGBA')
sprite.putalpha(alpha)
sprite = sprite.crop(alpha.getbbox())
sprite.thumbnail((940, 940), Image.Resampling.LANCZOS)
output = Image.new('RGBA', (1024, 1024))
output.alpha_composite(sprite, ((1024-sprite.width)//2, (1024-sprite.height)//2))
target_path.parent.mkdir(parents=True, exist_ok=True)
output.save(target_path)
review = Image.new('RGBA', output.size, '#F6F3EC')
review.alpha_composite(output)
review.convert('RGB').save(review_path)
print(target_path)
