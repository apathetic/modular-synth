module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'standard',
  plugins: [
    'html'
  ],
  globals: {
    'localStorage': true
  },

  // add your custom rules here
  rules: {
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'no-multiple-empty-lines': ['error', {'max': 3}],
    'arrow-parens': 0,

    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
