/**
 * CLAUDE.md Hard Rule #7 — the bottom nav has exactly 4 tabs.
 * Pinned to what bottom-nav.ts actually ships today (CLAUDE.md still
 * documents `season` where the code has `shop`); update EXPECTED in the same
 * commit as any deliberate, instructed tab change.
 */
const EXPECTED = ['home', 'achievements', 'shop', 'profile'];

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Keep the NavTab union at exactly the four known tabs' },
    schema: [],
    messages: {
      changed:
        'NavTab must stay exactly [{{expected}}] — found [{{actual}}] (CLAUDE.md Hard Rule #7).',
      shape: 'NavTab must stay a union of string literals (CLAUDE.md Hard Rule #7).',
    },
  },
  create(context) {
    return {
      TSTypeAliasDeclaration(node) {
        if (node.id.name !== 'NavTab') return;
        const t = node.typeAnnotation;
        const members = t.type === 'TSUnionType' ? t.types : [t];
        const names = [];
        for (const m of members) {
          if (m.type !== 'TSLiteralType' || typeof m.literal.value !== 'string') {
            context.report({ node, messageId: 'shape' });
            return;
          }
          names.push(m.literal.value);
        }
        const same =
          names.length === EXPECTED.length && EXPECTED.every((n, i) => names[i] === n);
        if (!same) {
          context.report({
            node,
            messageId: 'changed',
            data: { expected: EXPECTED.join(' | '), actual: names.join(' | ') },
          });
        }
      },
    };
  },
};
