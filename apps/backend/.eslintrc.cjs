module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  env: {
    node: true,
    es2020: true
  },
  plugins: ['@typescript-eslint', 'security'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:security/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }]
  }
};
