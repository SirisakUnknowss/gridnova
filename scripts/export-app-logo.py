from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
source = root / 'assets/space/generated/illustrations/31_app_icon_prompt.png'
with Image.open(source) as original:
    image = original.convert('RGB')
    for relative, size in {
        'assets/icon.png': 1024,
        'public/icons/icon-1024.png': 1024,
        'public/icons/icon-512.png': 512,
        'public/icons/icon-192.png': 192,
    }.items():
        image.resize((size, size), Image.Resampling.LANCZOS).save(root / relative, optimize=True)
    # Keep the full board inside the central maskable safe area.
    for size in (192, 512):
        canvas = Image.new('RGB', (size, size), image.getpixel((0, 0)))
        inset = round(size * 0.2)
        mark = image.resize((size - inset * 2, size - inset * 2), Image.Resampling.LANCZOS)
        canvas.paste(mark, (inset, inset))
        canvas.save(root / f'public/icons/icon-{size}-maskable.png', optimize=True)

with Image.open(root / 'assets/space/generated/illustrations/app-logo-transparent.png') as cutout:
    cutout = cutout.convert('RGBA')
    for size in (16, 32):
        cutout.resize((size, size), Image.Resampling.LANCZOS).save(
            root / f'public/icons/favicon-{size}-transparent.png', optimize=True)
    cutout.thumbnail((320, 320), Image.Resampling.LANCZOS)
    for relative in ('src/images/logo.png', 'public/icons/logo.png'):
        cutout.save(root / relative, optimize=True)
