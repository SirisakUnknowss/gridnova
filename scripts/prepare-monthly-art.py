from pathlib import Path
import sys
from PIL import Image

source = Path(sys.argv[1])
originals = Path('assets/space/monthly/moonlit-wishes')
runtime = Path('src/images/space/monthly')
originals.mkdir(parents=True, exist_ok=True)
runtime.mkdir(parents=True, exist_ok=True)
atlas = Image.open(source / 'exec-73f2ce2c-662d-49e7-9406-a643f6ea1710.png')
atlas.save(originals / 'collectibles-atlas.png')
names = ['lotus-otter', 'lotus-orbit', 'moonlit-river', 'moon-rabbit', 'full-moon-halo', 'river-of-stars']
for i, name in enumerate(names):
    if i in (1, 4):
        continue
    x, y = i % 3, i // 3
    tile = atlas.crop((x * atlas.width // 3, y * atlas.height // 2, (x + 1) * atlas.width // 3, (y + 1) * atlas.height // 2))
    tile.resize((512, 512), Image.Resampling.LANCZOS).save(runtime / f'{name}.webp', quality=85)
frames = Image.open(source / 'exec-03704507-7348-41a6-b271-53ce2935e580.png')
frames.save(originals / 'frames-transparent.png')
for i, name in enumerate(['lotus-orbit', 'full-moon-halo']):
    tile = frames.crop((i * frames.width // 2, 0, (i + 1) * frames.width // 2, frames.height))
    tile.resize((512, 512), Image.Resampling.LANCZOS).save(runtime / f'{name}.webp', quality=88)
hero = Image.open(source / 'exec-b2e05e75-d8ad-4a7a-ad15-ba6c01913ed6.png')
hero.save(originals / 'hero.png')
hero.resize((1024, 512), Image.Resampling.LANCZOS).save(runtime / 'moonlit-wishes.webp', quality=85)
print('Prepared seven runtime WebP assets; originals preserved in', originals)
