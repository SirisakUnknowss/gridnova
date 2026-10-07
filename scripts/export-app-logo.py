from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
source = root / 'assets/space/generated/illustrations/31_app_icon_prompt.png'
with Image.open(source) as original:
    image = original.convert('RGB')
    for relative, size in {
        'src/images/logo.png': 256,
        'public/icons/logo.png': 256,
        'assets/icon.png': 1024,
        'public/icons/icon-1024.png': 1024,
        'public/icons/icon-512.png': 512,
        'public/icons/icon-192.png': 192,
        'public/icons/favicon-16.png': 16,
    }.items():
        image.resize((size, size), Image.Resampling.LANCZOS).save(root / relative, optimize=True)
    # Keep the full board inside the central maskable safe area.
    for size in (192, 512):
        canvas = Image.new('RGB', (size, size), image.getpixel((0, 0)))
        inset = round(size * 0.2)
        mark = image.resize((size - inset * 2, size - inset * 2), Image.Resampling.LANCZOS)
        canvas.paste(mark, (inset, inset))
        canvas.save(root / f'public/icons/icon-{size}-maskable.png', optimize=True)
