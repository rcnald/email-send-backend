import config from '@rcnald/eslint-config/node'
import globals from 'globals'
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  ...config,
  {
    languageOptions: {
      globals: {
        ...globals.vitest,
      },
    },
    ignores: ["**/dist/**", "**/node_modules/**", "**/prisma/**", "**/docs/**"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },
]
