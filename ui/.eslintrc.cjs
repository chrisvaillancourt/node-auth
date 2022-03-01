module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'array-callback-return': 'error',
    'no-new-wrappers': 'error',
    eqeqeq: ['error', 'smart'],
    'no-var': 'off',
    'no-return-await': 'error',
  },
};
