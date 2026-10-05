from pathlib import Path
import json,re
from PIL import Image
root=Path.cwd()
jobs=json.loads((root/'assets/space/replacement-manifest.json').read_text(encoding='utf-8-sig'))
missing=[j['name'] for j in jobs if not (root/j['source']).exists()]
if missing: raise SystemExit('Missing images: '+str(missing))
for j in jobs:
    with Image.open(root/j['source']) as im:
        if im.mode != 'RGBA' or im.getextrema()[3][0] != 0: raise SystemExit('No alpha: '+j['name'])
        im.thumbnail((320,320),Image.Resampling.LANCZOS)
        im.save(root/j['target'],'WEBP',quality=85,method=6)
for p in (root/'src').rglob('*.ts'):
    text=p.read_text(encoding='utf-8')
    changed=text
    for j in jobs: changed=changed.replace('@images/'+j['original'],'@images/space/replacements/'+j['name']+'.webp')
    if changed!=text:p.write_text(changed,encoding='utf-8')
p=root/'scripts/export-space-assets.py'
text=p.read_text(encoding='utf-8')
marker="for name,(src,size) in exports.items():"
extra="exports.update({\n"+''.join("    'replacements/"+j['name']+"':('replacements/"+j['name']+"',320),\n" for j in jobs)+"})\n"
if "'replacements/coin'" not in text:text=text.replace(marker,extra+marker).replace("image.save(out / (name+'.webp')","(out / name).parent.mkdir(parents=True, exist_ok=True)\n        image.save(out / (name+'.webp')")
p.write_text(text,encoding='utf-8')
p=root/'assets/space/gallery.html'
text=p.read_text(encoding='utf-8')
section='<section id="replacements"><h2>Space replacements</h2><table><tbody>'
for i,j in enumerate(jobs):
    if i%3==0:section+='<tr>'
    path='generated/replacements/'+j['name']+'.png'
    section+='<td><figure><a href="'+path+'"><img src="'+path+'" width="180" loading="lazy" alt="'+j['name']+'"></a><figcaption>'+j['original']+'</figcaption></figure></td>'
    if i%3==2 or i==len(jobs)-1:section+='</tr>'
section+='</tbody></table></section>'
if 'id="replacements"' not in text:text=text.replace('</body>',section+'</body>').replace('82 assets','123 assets').replace('82 generated','123 generated')
p.write_text(text,encoding='utf-8')
p=root/'assets/space/generation-manifest.json'
manifest=json.loads(p.read_text(encoding='utf-8-sig'))
if not any(a['name']=='replacement_coin' for a in manifest['assets']):
    manifest['assets'] += [dict(name='replacement_'+j['name'],path=j['source'],transparent=True,sourcePrompt='prompts/replacements/'+j['name']+'.txt',generationSuffix='',promptOverride=j['prompt'],edits=[]) for j in jobs]
manifest['assetCount']=len(manifest['assets'])
p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
p=root/'assets/space/README.md'
text=p.read_text(encoding='utf-8')
if '41 legacy' not in text:text+='\n## Legacy icon replacements\n\n41 legacy icons and level medals were generated individually using built-in image_gen with transparent backgrounds. Originals: generated/replacements/. Runtime: src/images/space/replacements/. Exact prompts: prompts/replacements/. Source-to-runtime mapping: replacement-manifest.json. Time Attack uses the previously generated stopwatch. All matching TypeScript imports were replaced.\n'
p.write_text(text,encoding='utf-8')
print('Replaced',len(jobs),'assets; total',manifest['assetCount'])
