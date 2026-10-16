from pathlib import Path
from PIL import Image, ImageChops, ImageStat
import json
import shutil
import sys

root = Path('assets/space/monthly/2027')
catalog = json.loads((root / 'catalog.json').read_text(encoding='utf-8-sig'))
runtime = Path('src/images/space/monthly/2027')
runtime.mkdir(parents=True, exist_ok=True)
sources = json.loads((root / 'art-sources.json').read_text(encoding='utf-8-sig'))
portraits = json.loads((root / 'portrait-sources.json').read_text(encoding='utf-8-sig'))
frame_sources = json.loads((root / 'frame-sources.json').read_text(encoding='utf-8-sig'))
imports, art, avatars, frames, backgrounds = [], {}, {}, [], {}
def preserved_source(mapping, month, suffix):
    saved = root / f'{month}-{suffix}.png'
    if saved.exists():
        return saved
    shutil.copy2(Path(mapping[month]), saved)
    return saved

for collection in catalog:
    month = collection['month']
    source = preserved_source(sources, month, 'atlas')
    atlas = Image.open(source).convert('RGBA')
    w, h = atlas.size
    rgb = atlas.convert('RGB')
    def boundary(start, end):
        return max(range(int(h*start),int(h*end)), key=lambda y: sum(ImageStat.Stat(ImageChops.difference(rgb.crop((0,y-1,w,y)),rgb.crop((0,y,w,y+1)))).mean))
    top, middle = boundary(.2,.4), boundary(.52,.78)
    regions = [(0, 0, w, top)] + [(c*w//3, a, (c+1)*w//3, b) for a,b in [(top,middle),(middle,h)] for c in range(3)]
    for index, region in enumerate(regions):
        key = collection['hero'] if index == 0 else collection['rewards'][index-1]['art']
        image = atlas.crop(region).convert('RGB')
        if index in [1,4]:
            source_pair = preserved_source(portraits, month, 'portraits')
            pair = Image.open(source_pair).convert('RGB')
            half = 0 if index == 1 else 1
            image = pair.crop((half*pair.width//2,0,(half+1)*pair.width//2,pair.height))
        elif index in [2,5]:
            source_pair = preserved_source(frame_sources, month, 'frames')
            pair = Image.open(source_pair).convert('RGBA')
            half = 0 if index == 2 else 1
            image = pair.crop((half*pair.width//2,0,(half+1)*pair.width//2,pair.height))
            if image.getpixel((image.width//2,image.height//2))[3] > 20:
                raise ValueError(f'{month} frame center is not transparent')
        target = (1024, 341) if index == 0 else (384, 384)
        image.resize(target, Image.Resampling.LANCZOS).save(runtime / f'{key}.webp', quality=84)
        variable = f'art{len(imports)}'
        imports.append(f"import {variable} from '@images/space/monthly/2027/{key}.webp';")
        art[key] = variable
        if index:
            reward = collection['rewards'][index-1]
            if reward['type'] == 'Avatar': avatars[reward['id']] = variable
            elif reward['type'] == 'Frame': frames.append((reward, variable))
            else: backgrounds[reward['id']] = variable
def object_map(name, values):
    return f'export const {name}: Record<string,string> = {{' + ','.join(json.dumps(k)+':'+v for k,v in values.items()) + '};'
output = '\n'.join(imports) + '\n' + '\n'.join([object_map('YEAR_ART',art),object_map('YEAR_AVATARS',avatars),object_map('YEAR_BACKGROUNDS',backgrounds)])
output += '\nexport const YEAR_FRAMES = [' + ','.join('{id:'+json.dumps(r['id'])+',name:'+json.dumps(r['name'])+',price:0,style:"illustrated",art:'+v+'}' for r,v in frames) + '] as const;\n'
Path('src/lib/monthly-2027-art.ts').write_text(output,encoding='utf-8')
print('Prepared 70 assets, 20 avatars, 20 frames and 20 theme backgrounds')
