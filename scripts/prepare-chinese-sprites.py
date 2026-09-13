"""Remove the approved magenta production matte; preserve original character art."""
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
for name in ('walking', 'drinking'):
    source = Image.open(ROOT / f'design/game-assets/drafts/chinese-dino-{name}-matte.png').convert('RGB')
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
    target = ROOT / f'hub/img/games/chinese/dino-{name}.png'
    output.save(target)
    review = Image.new('RGBA', output.size, '#F6F3EC')
    review.alpha_composite(output)
    review.convert('RGB').save(ROOT / f'design/game-assets/drafts/chinese-dino-{name}-cream.png')
    print(target)
