"""User-approved cleanup of two identity-reviewed drafts, preserving interiors."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

root=Path(__file__).resolve().parents[1]
for draft,output,seed in [
 ('dino-drum-v1.png','music/dino-drum.png',(600,600)),
 ('robot-v2.png','computing/dino-robot.png',(550,600)),
 ('dino-jump-v1.png','english/dino-jump.png',(550,600)),
]:
 image=Image.open(root/'design/game-assets/drafts'/draft).convert('RGB')
 p=np.asarray(image).astype('int16')
 neutral=(p.max(2)-p.min(2)<25)&(p.min(2)>55)&(p.max(2)<245)
 regions=Image.fromarray(neutral.astype('uint8')).copy()
 ImageDraw.floodfill(regions,(0,0),255,thresh=0)
 if draft=='dino-drum-v1.png':
  if regions.getpixel((390,660))==1:
   ImageDraw.floodfill(regions,(390,660),255,thresh=0)
 mask=Image.fromarray(np.where(np.asarray(regions)==255,0,255).astype('uint8')).copy()
 # Keep the connected character, excluding isolated checkerboard dots outside it.
 ImageDraw.floodfill(mask,seed,128,thresh=0)
 alpha=Image.fromarray(np.where(np.asarray(mask)==128,255,0).astype('uint8'))
 alpha=alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.4))
 rgba=image.convert('RGBA');rgba.putalpha(alpha);rgba.thumbnail((940,940),Image.Resampling.LANCZOS)
 canvas=Image.new('RGBA',(1024,1024));canvas.alpha_composite(rgba,((1024-rgba.width)//2,(1024-rgba.height)//2))
 target=root/'hub/img/games'/output;target.parent.mkdir(parents=True,exist_ok=True);canvas.save(target,optimize=True)
 cream=Image.new('RGBA',canvas.size,'#F6F3EC');cream.alpha_composite(canvas)
 cream.convert('RGB').save(root/'design/game-assets/drafts'/f'{target.stem}-cream-review.png')
 print(target)
