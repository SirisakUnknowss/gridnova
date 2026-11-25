/**
 * GridNova ESLint config — enforces the machine-checkable parts of the
 * Hard Rules in CLAUDE.md. Local rules live in ./eslint-rules and are loaded
 * with --rulesdir (see the lint scripts in package.json).
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['dist', 'node_modules', 'public', 'android', 'ios', 'src/lib/database.types.ts'],
  rules: {
    // Hard Rule #2 — no hardcoded colors
    'no-hardcoded-colors': 'error',

    // Hard Rule #8 — the game is English-only
    'no-thai-text': 'error',

    // Hard Rule #7 — bottom nav has exactly 4 tabs
    'no-nav-tab-changes': 'error',

    // Hard Rule #4 — no console.log in production code; use Sentry.
    // warn/error stay allowed (already used for real failure paths).
    'no-console': ['error', { allow: ['warn', 'error'] }],

    // Hard Rule #5 — no `any` unless unavoidable (warn: 50+ existing cases)
    '@typescript-eslint/no-explicit-any': 'warn',

    // Tech-stack rule — no UI framework, vanilla TS only
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: 'react', message: 'No UI framework — GridNova is vanilla TypeScript (CLAUDE.md).' },
          { name: 'react-dom', message: 'No UI framework — GridNova is vanilla TypeScript (CLAUDE.md).' },
          { name: 'vue', message: 'No UI framework — GridNova is vanilla TypeScript (CLAUDE.md).' },
        ],
        patterns: ['react/*', 'react-dom/*', '@vue/*'],
      },
    ],
  },
  overrides: [
    {
      // Color definitions and canvas drawing legitimately need literal colors:
      // canvas has no access to CSS custom properties, and theme/palette files
      // are where the tokens are declared in the first place.
      files: [
        'src/lib/themes.ts',
        'src/lib/board-colors.ts',
        'src/lib/monthly-2027-themes.ts',
        'src/lib/chart.ts',
        'src/lib/share/**/*.ts',
        'src/ui/icons.ts',
      ],
      rules: { 'no-hardcoded-colors': 'off' },
    },
    {
      // Brand marks (Google "G", etc.) must keep their official colors.
      files: ['src/ui/views/auth-modal.ts'],
      rules: { 'no-hardcoded-colors': 'off' },
    },
    {
      files: ['tests/**/*.ts', 'scripts/**/*.{ts,mjs}'],
      rules: {
        'no-console': 'off',
        'no-thai-text': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
