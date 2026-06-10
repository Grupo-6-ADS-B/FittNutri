import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignora dist e arquivos de backup
  globalIgnores(['dist', '**/*_OLD_BACKUP*', '**/*_BACKUP*']),

  // Arquivos de configuração (vite.config.js etc.) — precisam de globals do Node
  {
    files: ['*.config.js', '*.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Código-fonte da aplicação
  {
    files: ['**/*.{js,jsx}'],
    ignores: ['*.config.js'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Variáveis não usadas → aviso (não quebra o build)
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // Blocos catch vazios → aviso
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // Escape desnecessário → aviso
      'no-useless-escape': 'warn',
    },
  },
])
