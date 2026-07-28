import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

/**
 * ESLint flat config.
 *
 * Next 16 removed the `next lint` command — it now parses `lint` as a
 * directory argument and fails with "Invalid project directory provided".
 * `npm run lint` therefore runs ESLint directly.
 *
 * `eslint-config-next` v16 ships native flat configs, so this imports the
 * config array straight from the subpath export. Do NOT reach for
 * @eslint/eslintrc + FlatCompat here: wrapping an already-flat config in the
 * compat layer crashes with "Converting circular structure to JSON" when the
 * react plugin's self-referential `configs` object is serialized.
 */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
      '.vercel/**',
      'supabase/**',
    ],
  },
  ...(Array.isArray(nextCoreWebVitals) ? nextCoreWebVitals : [nextCoreWebVitals]),
];

export default config;
