/**
 * CLAUDE.md Hard Rule #8 — the game is English-only.
 * Flags Thai characters in strings/templates that can reach the UI.
 * Comments are dev-facing and are left alone.
 */
const THAI_RE = /[฀-๿]/;

module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow Thai text in app code (English-only UI)' },
    schema: [],
    messages: {
      thai: 'Thai text in app code — all in-app copy must be English (CLAUDE.md Hard Rule #8).',
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && THAI_RE.test(node.value)) {
          context.report({ node, messageId: 'thai' });
        }
      },
      TemplateElement(node) {
        if (THAI_RE.test(node.value.raw)) {
          context.report({ node, messageId: 'thai' });
        }
      },
    };
  },
};
