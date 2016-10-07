'use strict';

const assert      = require('assert');
const async       = require('asyncawait/async');
const wait        = require('asyncawait/await');
const Heroku      = require('./heroku');
const LetsEncrypt = require('letsencrypt');
const log         = require('log')('example-server');

const baseOptions = {
  agreeTos: true,
  server:   LetsEncrypt.stagingServerUrl,
};

let getCertificate = async(options => {
  try {
    const heroku = new Heroku({
      apiKey: options.apiKey,
      app:    options.appName,
    });

    // Unset the server, because it breaks lets encrypt
    delete options.server;

    // Get domains
    let domains = wait(heroku.request({
      method: 'GET',
      qs:     {kind: 'custom'},
      url:    '/domains',
    }))
    .filter(d => d.kind === 'custom')
    .map(d => d.hostname)
    ;
    log.info('Heroku domains', domains);
    options.domains = domains;
    options.approveDomains = domains;
    assert(options.domains.length, 'You need to setup a custom domain in Heroku');

    // Get certs from letsencrypt
    let certs = wait(options.letsencrypt.register(options));
    // Find out if there is a Heroku cert already
    let endpoint = wait(heroku.request({
      method: 'GET',
      url:    'sni-endpoints',
    }))[0];
    let endpointSpec = '';
    if (endpoint) {
      endpointSpec = `/${endpoint.id}`;
      log.info('Adding Heroku certificate');
    }
    else log.info('Updating Heroku certificate');
    wait(heroku.request({
      body: {
        certificate_chain: certs.cert + '\n' + certs.chain,
        private_key:       certs.privkey,
      },
      method: endpoint ? 'PATCH' : 'POST',
      url:    'sni-endpoints' + endpointSpec,
    }));
    log.info('Heroku certificate updated');
  }
  catch (error) {
    log.error(error.stack || error);
  }
})
;

/**
 * This function will start the server on the specified port. It returns a
 * promise that will be resolved when the server is running.
 *
 * @param {object} options         Map of options for the letsencrypt certificate system
 * @param {string} options.apiKey  The Heroku API key, which can be found in your account preferences
 * @param {string} options.appName The name of the Heroku application this is running in
 * @param {string} options.email   An email address for the let's encrypt account
 * @param {string} options.server  The letsencrypt server that should be used (staging|production) (default: staging)
 *
 * @return {middleware} The letsencrypt middleware
 */
module.exports = options => {
  // Check for an email for the let's encrypt account
  assert(options.email,   'email is required');
  assert(options.appName, 'appName is required');
  assert(options.apiKey,  'apiKey is required');

  let server = options.server === 'production' ?
    LetsEncrypt.productionServerUrl :
    LetsEncrypt.stagingServerUrl
  ;
  if (server === LetsEncrypt.productionServerUrl)
    log.info('Using production server');
  else log.warn('Using staging server');
  let letsencrypt = LetsEncrypt.create({server});
  getCertificate(Object.assign({}, baseOptions, options, {letsencrypt}));
  return letsencrypt.middleware();
};
