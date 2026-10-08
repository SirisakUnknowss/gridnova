import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

it('keeps pictographic emoji out of player UI templates and share drawing', () => {
  const root = path.resolve('src');
  const findings: string[] = [];
  const legacyAvatarIds = new Set(['👤', '🤖', '🦸', '🧙', '🥷', '🐱', '🦊', '🐼', '🐯', '🦁', '🐸', '🐧', '🦉', '🐙', '👻', '🧑']);
  const avatarCompatibilityFiles = new Set(['lib/guest-identity.ts', 'ui/components/avatar-art.ts']);
  const avatarDefaultFiles = new Set(['main.ts', 'state/store.ts', 'ui/views/game.ts', 'ui/views/home.ts', 'ui/views/profile.ts', 'ui/views/shop.ts']);
  function scan(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { scan(file); continue; }
      if (!file.endsWith('.ts')) continue;
      const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      function visit(node: ts.Node) {
        const relative = path.relative(root, file).replaceAll('\\', '/');
        if (ts.isStringLiteral(node) && /\p{Extended_Pictographic}/u.test(node.text)) {
          const compatibilityId = avatarCompatibilityFiles.has(relative) && legacyAvatarIds.has(node.text);
          const defaultId = avatarDefaultFiles.has(relative) && node.text === '👤';
          if (!compatibilityId && !defaultId) findings.push(`${relative}:${source.getLineAndCharacterOfPosition(node.pos).line + 1}`);
        }
        if ((ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) && /\p{Extended_Pictographic}/u.test(node.text)) {
          findings.push(`${path.relative(root, file)}:${source.getLineAndCharacterOfPosition(node.pos).line + 1}`);
        }
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'fillText') {
          const arg = node.arguments[0];
          if (arg && ts.isStringLiteral(arg) && /\p{Extended_Pictographic}/u.test(arg.text)) findings.push(path.relative(root, file));
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  scan(root);
  for (const file of ['index.html', 'functions/_middleware.js', 'public/admin/index.html']) {
    if (/\p{Extended_Pictographic}/u.test(readFileSync(file, 'utf8'))) findings.push(file);
  }
  expect(findings).toEqual([]);
});
