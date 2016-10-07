'use strict';

const assert      = require('assert');
const async       = require('asyncawait/async');
const await       = require('asyncawait/await');
const Heroku      = require('./heroku');
const http        = require('http');
const LetsEncrypt = require('letsencrypt');
const log         = require('log')('example-server');

const baseOptions = {
  agreeTos: true,
  email:    'tarwich@gmail.com',
  server:   'staging',
};

/**
 * This function will start the server on the specified port. It returns a
 * promise that will be resolved when the server is running.
 *
 * @param {object} options            Map of options for the letsencrypt certificate system
 * @param {string} options.email      An email address for the let's encrypt account
 * @param {String} options.apiKey     The Heroku API key, which can be found in your account preferences
 * @param {String} options.appName    The name of the Heroku application this is running in
 * @param {String} options.expressApp The letsencrypt system isn't really middleware, but instead is a full express server that uses YOUR app as middleware. Therefore you must pass in your app so that we can pass all requests to your app when we're done trying to handle them
 *
 * @return Promise A promise that will be resolved when the server is running. The promise will be resolved with an instance of the server.
 */
module.exports = async(options => {
  try {
    // Merge with the baseOptions
    options = Object.assign({}, baseOptions, options);

    // Check for an email for the let's encrypt account
    assert(options.email,      'email is required');
    assert(options.expressApp, 'expressApp is required');
    assert(options.appName,    'appName is required');
    assert(options.apiKey,     'apiKey is required');

    const heroku = new Heroku({
      apiKey: options.apiKey,
      app:    'voidray-test',
    });

    // Get domains
    let domains = await(heroku.request({
      method: 'GET',
      qs:     {kind: 'custom'},
      url:    '/domains',
    }));

    options.domains = domains
    .filter(d => d.kind === 'custom')
    .map(d => d.hostname)
    ;
    options.approveDomains = [...domains];
    assert(options.domains.length, 'You need to setup a custom domain in Heroku');

    let letsencrypt = LetsEncrypt.create(options);
    // Create the express server to answer letsencrypt stuff
    let server = http.createServer(letsencrypt.middleware(options.expressApp));
    // Get certs from letsencrypt
    let certs = await(letsencrypt.register(options));
    // Find out if there is a Heroku cert already
    let endpoints = await(heroku.request({
      method: 'GET',
      url:    'sni-endpoints',
    }));
    let endpointSpec = '';
    if (endpoints.length) {
      endpointSpec = `/${result[0].id}`;
      log.info('Adding Heroku certificate');
    }
    else log.info('Updating Heroku certificate');
    await(heroku.request({
      body: {
        certificate_chain: certs.cert,
        private_key:       certs.privkey,
      },
      method: result.length ? 'PATCH' : 'POST',
      url:    'sni-endpoints' + endpointSpec,
    }));
    log.info('Heroku certificate updated')

    // Return the wrapper app that we made
    return server;
  }
  catch(error) {
    log.error(error.stack || error);
  }
})
;
