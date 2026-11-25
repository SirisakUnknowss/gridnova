/**
 * CLAUDE.md Hard Rule #2 — no hardcoded colors.
 * Colors belong in main.css as CSS custom properties; TS should reference
 * var(--token). Canvas/theme-definition files are allowlisted in .eslintrc.cjs.
 */
const COLOR_RE =
  /(#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\s*\()/;

function check(context, node, raw) {
  const m = COLOR_RE.exec(raw);
  if (!m) return;
  context.report({
    node,
    messageId: 'hardcoded',
    data: { color: m[0] },
  });
}

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow hardcoded color values; use CSS custom properties' },
    schema: [],
    messages: {
      hardcoded:
        'Hardcoded color "{{color}}" — define it in main.css and use var(--token) instead (CLAUDE.md Hard Rule #2).',
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string') check(context, node, node.value);
      },
      TemplateElement(node) {
        check(context, node, node.value.raw);
      },
    };
  },
};
