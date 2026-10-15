import { readFileSync, appendFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync('supabase/functions/generate-daily-puzzle/index.ts','utf8').split('// Handler')[0].replace(/^import .*;\r?\n/gm,'') + '\nexport { generatePuzzle, serialize };';
const { outputText } = ts.transpileModule(source,{ compilerOptions: { target: ts.ScriptTarget.ES2022,module: ts.ModuleKind.ES2022 } });
const engine = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
const rows = [];
for (let day=1; day<=30; day++) {
  const date = `2026-11-${String(day).padStart(2,'0')}`;
  const puzzle = engine.generatePuzzle('medium',`monthly:moonlit-wishes:${date}`);
  rows.push(`('${date}','${engine.serialize(puzzle.puzzle)}','${engine.serialize(puzzle.solution)}')`);
}
const sql = '\ninsert into monthly_private.puzzles(date,puzzle,solution) values\n' + rows.join(',\n') + ';\n';
if (process.argv[2]) appendFileSync(process.argv[2],sql);
else process.stdout.write(sql);
