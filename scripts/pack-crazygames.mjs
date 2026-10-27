// Strips the web-only files out of dist-crazygames/ before it's zipped for
// upload: the admin panel, Pages routing, SEO and Search Console files mean
// nothing inside CrazyGames' iframe and count toward their file limit.
import { rmSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const out = 'dist-crazygames';
const drop = ['admin', '_routes.json', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest'];

for (const name of drop) rmSync(path.join(out, name), { recursive: true, force: true });
for (const name of readdirSync(out)) {
  if (/^google.*\.html$/.test(name)) rmSync(path.join(out, name));
}

let files = 0;
let bytes = 0;
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else { files++; bytes += st.size; }
  }
};
walk(out);
process.stdout.write(`${out}: ${files} files, ${(bytes / 1024 / 1024).toFixed(1)} MB (CrazyGames limit: 1500 files, 250 MB)\n`);
