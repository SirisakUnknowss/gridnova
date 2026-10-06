import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import ts from 'typescript';

const source = readFileSync('supabase/functions/generate-daily-puzzle/index.ts', 'utf8')
  .split('// Handler')[0]
  .replace(/^import .*;\r?\n/gm, '') + '\nexport { generatePuzzle, difficultyForDay, serialize };';
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const engine = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));
const rows = [];
const start = process.argv[2] ?? new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) throw new Error('Expected YYYY-MM-DD');
for (let i = 0; i < 30; i++) {
  const date = new Date(start + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + i);
  const day = date.toISOString().slice(0, 10);
  const difficulty = engine.difficultyForDay(date.getUTCDay());
  const seed = 'daily:' + day;
  const generated = engine.generatePuzzle(difficulty, seed);
  const puzzle = engine.serialize(generated.puzzle);
  const solution = engine.serialize(generated.solution);
  const hash = createHash('sha256').update(solution).digest('hex');
  rows.push(`('${day}','${difficulty}',${puzzle.replaceAll('0', '').length},'${puzzle}','${solution}','${hash}','${seed}')`);
}
process.stdout.write('INSERT INTO public.daily_puzzles (date,difficulty,clues,puzzle,solution,solution_hash,generation_seed) VALUES\n' + rows.join(',\n') + '\nON CONFLICT (date) DO NOTHING;');
