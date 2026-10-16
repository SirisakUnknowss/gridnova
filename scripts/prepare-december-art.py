from pathlib import Path
import sys
from PIL import Image

source = Path(sys.argv[1])
originals = Path('assets/space/monthly/christmas-day')
runtime = Path('src/images/space/monthly')
originals.mkdir(parents=True, exist_ok=True)
runtime.mkdir(parents=True, exist_ok=True)
files = {
    'christmas-hero': 'exec-bea85e62-1e33-4ec5-8ba4-f620214009b9.png',
    'snowflake-girl': 'exec-389758e8-1247-423a-9b19-6c5d0791b9ec.png',
    'christmas-boy': 'exec-f6037f22-0fbc-4bdd-8391-9cdd5b65c80f.png',
    'candy-cane-orbit': 'exec-70f5543c-7d4b-4f0a-b248-677cf16b4bfc.png',
    'starlight-wreath': 'exec-99768a13-e96d-41bd-9e9a-4438e6a5348b.png',
    'winter-wonderland': 'exec-9a796a81-0b16-4a57-9f25-619dc4f95f37.png',
    'christmas-eve': 'exec-f9e81c76-6656-4be3-8d9a-f77af71277eb.png',
}
for name, filename in files.items():
    image = Image.open(source / filename)
    image.save(originals / f'{name}.png')
    size = (1024, 512) if name == 'christmas-hero' else (512, 512)
    image.resize(size, Image.Resampling.LANCZOS).save(runtime / f'{name}.webp', quality=85)
square_portrait = originals / 'snowflake-girl-square-v2.png'
if square_portrait.exists():
    Image.open(square_portrait).resize((512, 512), Image.Resampling.LANCZOS).save(runtime / 'snowflake-girl.webp', quality=85)
print('Prepared seven Christmas Day runtime assets')
child_pair = originals / 'christmas-child-portraits-v3.png'
if child_pair.exists():
    pair = Image.open(child_pair)
    for half, name in enumerate(['snowflake-girl', 'christmas-boy']):
        pair.crop((half*pair.width//2, 0, (half+1)*pair.width//2, pair.height)).resize((512,512), Image.Resampling.LANCZOS).save(runtime / f'{name}.webp', quality=85)
