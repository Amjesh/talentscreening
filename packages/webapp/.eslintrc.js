module.exports = {
 parser: 'babel-eslint',
 env: {
  browser: true,
  node: true,
  es6: true,
  jest: true,
 },
 extends: [
  'eslint:recommended',
  'airbnb',
  'prettier',
  'prettier/react',
  'plugin:react/recommended',
  'plugin:jsdoc/recommended',
 ],
 plugins: ['prettier', 'import', 'flowtype', 'jest', 'jsdoc'],
 rules: {
  'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
  'jsx-a11y/label-has-for': 0,
  'jsx-a11y/label-has-associated-control': 0,
  'no-shadow': 0,
  'react/forbid-prop-types': 0,
  radix: 0,
  'no-underscore-dangle': 0,
 },
 settings: {
  'import/resolver': {
   alias: {
    map: [
     ['lib', './src/lib'],
     ['pages', './src/pages'],
     ['reducer', './src/reducer'],
     ['sharedComponents', './src/sharedComponents'],
    ],
    extensions: ['.ts', '.js', '.jsx', '.json'],
   },
  },
 },
};
