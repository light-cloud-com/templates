import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import svelteConfig from './svelte.config.js'

export default [
  { ignores: ['dist', 'coverage'] },
  js.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: { svelteConfig },
    },
  },
]
