module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Add custom rules here
    'no-unused-vars': 'warn',
    'no-console': 'warn' // using winston for logging
  }
};
