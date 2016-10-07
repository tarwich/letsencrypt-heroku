'use strict';

const path = require('path');

module.exports = {
  extends: path.resolve('node_modules', 'eslint-config-tarwich', 'index.js'),
  rules:   {
    'no-unused-vars': ['error', {'after-used': true}],
  },
};
