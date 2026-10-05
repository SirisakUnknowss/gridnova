from pathlib import Path
import json
from PIL import Image,ImageDraw
jobs=[('lunar-fox','Lunar Fox'),('nebula-cat','Nebula Cat'),('comet-panda','Comet Panda'),('cosmo-owl','Cosmo Owl'),('nova-dragon','Nova Dragon'),('astra-knight','Astra Knight'),('orbit-bunny','Orbit Bunny'),('solar-lion','Solar Lion')]
root=Path.cwd()
out=root/'src/images/space/avatars'
out.mkdir(parents=True,exist_ok=True)
canvas=Image.new('RGB',(800,440),'#efedf8')
draw=ImageDraw.Draw(canvas)
for i,(name,title) in enumerate(jobs):
    with Image.open(root/f'assets/space/generated/avatars/{name}.png') as im:
        if im.mode!='RGBA' or im.getextrema()[3][0]!=0:raise SystemExit('Missing transparency '+name)
        im.thumbnail((240,240),Image.Resampling.LANCZOS)
        im.save(out/f'{name}.webp','WEBP',quality=85,method=6)
        preview=im.copy()
        preview.thumbnail((170,180),Image.Resampling.LANCZOS)
        canvas.paste(preview,(i%4*200+15,i//4*220+10),preview)
        draw.text((i%4*200+15,i//4*220+195),title,fill='#28224d')
canvas.save(root/'assets/space/qa/new-avatars.jpg')
p=root/'src/ui/components/avatar-art.ts'
s=p.read_text(encoding='utf-8')
imports=''.join("import avatar"+str(i)+" from '@images/space/avatars/"+name+".webp';\n" for i,(name,_) in enumerate(jobs))
helper="\nfunction portrait(src: string, size = 48): string {\n  return "+chr(96)+'<img class="ui-art-icon" src="'+'$'+'{src}" width="'+'$'+'{size}" height="'+'$'+'{size}" alt="" decoding="async">'+chr(96)+";\n}\n"
entries=''.join("  { id: 'space_"+name+"', name: '"+title+"', art: (size?: number) => portrait(avatar"+str(i)+", size) },\n" for i,(name,title) in enumerate(jobs))
if 'space_lunar-fox' not in s:s=imports+s.replace('export const AVATAR_OPTIONS = [',helper+'\nexport const AVATAR_OPTIONS = [\n'+entries)
p.write_text(s,encoding='utf-8')
p=root/'scripts/export-space-assets.py';s=p.read_text(encoding='utf-8')
addition="exports.update({\n"+''.join("  'avatars/"+name+"':('avatars/"+name+"',240),\n" for name,_ in jobs)+"})\n"
if "'avatars/lunar-fox'" not in s:s=s.replace('for name,(src,size) in exports.items():',addition+'for name,(src,size) in exports.items():')
p.write_text(s,encoding='utf-8')
p=root/'assets/space/generation-manifest.json'
manifest=json.loads(p.read_text(encoding='utf-8'))
for name,title in jobs:
    if not any(a['name']=='avatar_'+name for a in manifest['assets']):
        manifest['assets'].append(dict(name='avatar_'+name,path=f'assets/space/generated/avatars/{name}.png',transparent=True,sourcePrompt=f'prompts/avatars/{name}.txt',promptOverride=(root/f'assets/space/prompts/avatars/{name}.txt').read_text(),generationSuffix='',edits=[]))
manifest['assetCount']=len(manifest['assets'])
p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
p=root/'assets/space/gallery.html';s=p.read_text(encoding='utf-8')
section='<section id="avatars"><h2>New profile avatars</h2>'+''.join(f'<figure><img src="generated/avatars/{name}.png" width="180" alt="{title}"><figcaption>{title}</figcaption></figure>' for name,title in jobs)+'</section>'
if 'id="avatars"' not in s:s=s.replace('</body>',section+'</body>').replace('126 PNG originals','134 PNG originals')
p.write_text(s,encoding='utf-8')
p=root/'assets/space/README.md';s=p.read_text(encoding='utf-8').replace('126 final PNG','134 final PNG').replace('as 84 WebP files','as 92 WebP files')
if '## New profile avatars' not in s:s+='\n## New profile avatars\n\n8 original character portraits generated individually using built-in image_gen. Transparent PNG: generated/avatars/. Exact prompts: prompts/avatars/. Runtime WebP: src/images/space/avatars/. Added to the profile picker alongside existing options.\n'
p.write_text(s,encoding='utf-8')
print('Added 8 new portraits; total picker options 24')
