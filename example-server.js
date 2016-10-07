'use strict';

// Libraries
const letsEncryptHeroku = require('./letsEncryptHeroku');
const express           = require('express');

// Variables
const app = express();

app.use('/', letsEncryptHeroku({
  apiKey:  process.env.API_KEY,
  appName: 'voidray-test',
  email:   process.env.LETSENCRYPT_EMAIL,
}));

app.use((request, response) => {
  response.send('It\'s alive!');
});

// Run the server
let server = app.listen(process.env.PORT || 8080, () => {
  let href = server.address();
  if (href.family === 'IPv6') href = `http://[${href.address}]:${href.port}/`;
  else href = `http://${href.address}:${href.port}/`;
  console.log('Server running at ' + href);
});
