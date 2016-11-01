'use strict';

const co = require('co');

let fun = fail => new Promise(resolve =>
  setTimeout(() => {
    if (fail) resolve(null);
    else resolve(['aaa', 'bbb', 'ccc']);
  }, 1000)
);

co(function * () {
  console.log('starting');
  let aaa = (yield fun(true)) || 'asdf';
  console.log('first test', aaa);
  // let bbb = (yield fun()).filter;
  // console.log('second test', bbb);
});
