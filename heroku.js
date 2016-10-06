'use strict';

const log     = require('log')('heroku', 'debug');
const request = require('request');

/**
 * Class to interact with the Heroku platform API
 */
class Heroku {
  /**
   * Create a new instance of the Heroku platform API
   *
   * @param {Object} options        The options for instantiating this class
   * @param {String} options.apiKey The api key for interacting with the API
   * @param {String} options.app    The name of your Heroku application
   */
  constructor(options) {
    this.apiKey = options.apiKey;
    this.app    = options.app;
  }

  /**
   * Send a request to Heroku
   *
   * @param {Object} options Options for the request
   *
   * @return {Promise} A promise that will be resolved with the result of the request
   */
  request(options) {
    // Ensure a valid API KEY is present
    if (!(this.apiKey || options.apiKey)) {
      log.error('Missing apiKey');
      return Promise.reject('Missing apiKey');
    }

    return new Promise((resolve, reject) => {
      let url = `https://api.heroku.com/apps/${this.app}/${options.url}`
      .replace(/([^:]\/)(?:\/+|$)/g, '$1');
      let query = {
        body:    options.body || {},
        json:    true,
        method:  options.method || 'GET',
        url:     url,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept:        'application/vnd.heroku+json; version=3',
        },
      };
      log.debug(query);

      request(query, (error, response) => {
        if (error) reject(error);
        else if (Number(response.statusCode) >= 300) reject(response.body);
        else resolve(response.body);
      });
    });
  }
}

module.exports = Heroku;
