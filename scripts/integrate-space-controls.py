from pathlib import Path
import re,json
from PIL import Image
root=Path.cwd()
out=root/'src/images/space/controls'
out.mkdir(parents=True,exist_ok=True)
for name in ['close','back','volume']:
    with Image.open(root/f'assets/space/generated/controls/{name}.png') as im:
        im.thumbnail((160,160),Image.Resampling.LANCZOS)
        im.save(out/f'{name}.webp','WEBP',quality=85,method=6)
p=root/'src/ui/icons.ts'
s=p.read_text(encoding='utf-8')
s="import closeControl from '@images/space/controls/close.webp';\nimport backControl from '@images/space/controls/back.webp';\n"+s
s=s.replace('export const ic = {','export const ic = {\n  close: (s?: number) => img(closeControl, s),\n  back: (s?: number) => img(backControl, s),')
p.write_text(s,encoding='utf-8')
for p in (root/'src/ui').rglob('*.ts'):
    s=p.read_text(encoding='utf-8')
    t=re.sub(r'<svg[^>]*>\s*<polyline points="15 18 9 12 15 6"\s*/>\s*</svg>',lambda m:'$'+'{ic.back(26)}',s)
    t=re.sub(r'(<button[^>]*class="modal-close"[^>]*>)[×✕](</button>)',lambda m:m[1]+'$'+'{ic.close(24)}'+m[2],t)
    if t!=s:
        if "from '@ui/icons'" not in t and "from '../icons'" not in t:t="import { ic } from '@ui/icons';\n"+t
        p.write_text(t,encoding='utf-8')
p=root/'src/ui/views/whats-new.ts'
s=p.read_text(encoding='utf-8')
mapping={'✅':'heart','♾️':'repeat','🚫':'warning','❌':'close','❤️':'heart','🔄':'repeat','📖':'bookMode','📈':'stats','⚡':'zap','🪙':'coin','⏱️':'timeAttack','🧪':'brain','🏆':'trophy','📅':'daily','✨':'sparkle','🔢':'puzzle','📋':'notes','👆':'target','🔇':'soundOff','🗓️':'quests','💰':'coin','📊':'chart','📱':'gamepad','🐛':'warning','⚙️':'brain','🎵':'soundOn','📳':'wave','🔔':'bell','🎁':'gift','🎯':'target'}
helper="const releaseIcons: Record<string, (size?: number) => string> = {\n"+''.join("  '"+k+"': ic."+v+",\n" for k,v in mapping.items())+"};\n"
s=s.replace("const SEEN_KEY =",helper+"\nconst SEEN_KEY =")
s=s.replace('$'+'{c.icon}','$'+'{(releaseIcons[c.icon] ?? ic.sparkle)(26)}')
p.write_text(s,encoding='utf-8')
p=root/'src/ui/styles/main.css'
with p.open('a',encoding='utf-8') as f:f.write("""
.vol-slider { height: 40px; touch-action: pan-y; }
.vol-slider::-webkit-slider-runnable-track { height: 8px; border-radius: 8px; }
.vol-slider::-moz-range-track { height: 8px; border-radius: 8px; }
.vol-slider::-webkit-slider-thumb {
  width: 36px; height: 36px; margin-top: -14px;
  background: url('../../images/space/controls/volume.webp') center / contain no-repeat;
  box-shadow: none; border: none;
}
.vol-slider::-moz-range-thumb {
  width: 36px; height: 36px;
  background: url('../../images/space/controls/volume.webp') center / contain no-repeat;
  box-shadow: none; border: none;
}
.whatsnew-ico { width: 30px; height: 30px; }
.modal-close .ui-art-icon { width: 26px; height: 26px; }
.icon-btn[aria-label="Back"] .ui-art-icon { width: 28px; height: 28px; }
.vol-slider:focus-visible { outline: 2px solid var(--brand-primary); outline-offset: 3px; border-radius: 12px; }
""")
p=root/'scripts/export-space-assets.py'
s=p.read_text(encoding='utf-8').replace('for name,(src,size) in exports.items():',"exports.update({name:('controls/'+name.split('/')[-1],160) for name in ['controls/close','controls/back','controls/volume']})\nfor name,(src,size) in exports.items():")
p.write_text(s,encoding='utf-8')
p=root/'assets/space/generation-manifest.json'
manifest=json.loads(p.read_text(encoding='utf-8'))
for name in ['close','back','volume']:
    manifest['assets'].append(dict(name='control_'+name,path=f'assets/space/generated/controls/{name}.png',transparent=True,sourcePrompt=f'prompts/controls/{name}.txt',promptOverride=(root/f'assets/space/prompts/controls/{name}.txt').read_text(),generationSuffix='',edits=[]))
manifest['assetCount']=len(manifest['assets'])
p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
p=root/'assets/space/gallery.html'
s=p.read_text().replace('123 PNG originals','126 PNG originals')
section='<section><h2>Controls</h2>'+''.join(f'<figure><img src="generated/controls/{n}.png" width="160" alt="{n}"><figcaption>{n}</figcaption></figure>' for n in ['close','back','volume'])+'</section>'
p.write_text(s.replace('</body>',section+'</body>'),encoding='utf-8')
print('Integrated controls and release note illustrations')
