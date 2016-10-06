'use strict';

const chalk       = require('chalk');
const Heroku      = require('./heroku');
const http        = require('http');
const LetsEncrypt = require('letsencrypt');
const log         = require('log')('example-server');

const options = {
  server:         'staging',
  email:          'tarwich@gmail.com',
  agreeTos:       true,
  domains:        ['voidray-test.herokuapp.com'],
  approveDomains: ['voidray-test.herokuapp.com'],
};

const letsencrypt = LetsEncrypt.create(options);
let port = process.env.PORT || 8080;

let app = (request, response) => {
  response.send('It is alive');
};

http.createServer(letsencrypt.middleware(app))
.listen(port, function() {
  console.log('Handling ACME challenges and serving https');
});

const heroku = new Heroku({
  app:    'voidray-test',
  apiKey: process.env.API_KEY,
});

letsencrypt.register(options)
.then(certs => {
  return heroku.request({
    method: 'GET',
    url:    'sni-endpoints',
  })
  .then(result => {
    let endpointSpec = '';
    if (result.length) endpointSpec = `/${result[0].id}`;
    log.info('Updating certificate');

    return heroku.request({
      method: result.length ? 'PATCH' : 'POST',
      url:    '/sni-endpoints' + endpointSpec,
      body:   {
        private_key:       certs.privkey,
        certificate_chain: certs.cert,
      },
    })
    .then(result => {
      if (result) log.info('Certificate updated %s', chalk.green('[OK]'));
    });
  });
})
.catch(error => {
  log.error(error.stack || error);
});
