'use strict';

const path = require('path');

module.exports = {
  extends: path.resolve('node_modules', 'eslint-config-tarwich', 'index.js'),
  rules:   {
    'no-unused-vars': ['error', {'after-used': true}],
    'camelcase':      ['error', {'properties': 'never'}],
    'max-len':        ['error', 100, {'ignoreComments': true}]
  },
};
