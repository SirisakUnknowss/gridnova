import { readFileSync, appendFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync('supabase/functions/generate-daily-puzzle/index.ts','utf8').split('// Handler')[0].replace(/^import .*;\r?\n/gm,'') + '\nexport { generatePuzzle, serialize };';
const { outputText } = ts.transpileModule(source,{ compilerOptions: { target: ts.ScriptTarget.ES2022,module: ts.ModuleKind.ES2022 } });
const engine = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
const rows = [];
const month = process.argv[3] ?? '2026-11';
if (!/^(2026-(11|12)|2027-(0[1-9]|10))$/.test(month)) throw new Error('Unsupported collection month');
const days = new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5)),0)).getUTCDate();
const collection = month === '2026-12' ? 'christmas-day' : month === '2026-11' ? 'moonlit-wishes' : month;
for (let day=1; day<=days; day++) {
  const date = `${month}-${String(day).padStart(2,'0')}`;
  const puzzle = engine.generatePuzzle('medium',`monthly:${collection}:${date}`);
  rows.push(`('${date}','${engine.serialize(puzzle.puzzle)}','${engine.serialize(puzzle.solution)}')`);
}
const sql = '\ninsert into monthly_private.puzzles(date,puzzle,solution) values\n' + rows.join(',\n') + ';\n';
if (process.argv[2]) appendFileSync(process.argv[2],sql);
else process.stdout.write(sql);
