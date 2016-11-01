# Lets Encrypt for Heroku

This is a module that will register a certificate with letsencrypt and store the resulting certificate in Heroku.

## Configuration

### API Key

This module needs your Heroku API key. Get this from https://dashboard.heroku.com/account near the bottom of the page.

### Calling letsencrypt-heroku

Drop this code somewhere in your route chain so that it can configure your certificate.

````node
// However you load your config... This is helpful, because sometimes you want
// to disable lets encrypt (for example: for local development)
let config = require('config.json');

// Disable lets encrypt for local development
if (!(config && config.letsNotEncrypt)) {
  // Enable lets encrypt
  server.use(require('letsencrypt-heroku')({
    // Your Heroku API KEY
    apiKey:  process.env.API_KEY,
    // The name of your Heroku app, because it's currently not possible to
    // automatically detect this
    appName: 'voidray-portal',
    // An email address to use to associate your lets encrypt stuff
    email:   process.env.LETSENCRYPT_EMAIL,
    // Change this to 'staging' to test lets encrypt. When you get it working,
    // set it to production
    server:  'production',
  }));
}
````

### Heroku configuration

If you use the above code, then you'll need to add some environment variables
to Heroku.

| key | description |
|-----|-------|
| LETSENCRYPT_EMAIL | (some email address) |
| API_KEY | From: https://dashboard.heroku.com/account |

## Gotchas

This module must be placed somewhere in your routing chain so that it can receive calls from letsencrypt in order to resolve your domain and validate your certificate.

### Too early

Sometimes if you put this module before your `app.use(express.static('...'))`, it will break things. Try moving it after.

### Too late

If you have a catchall route, then letsencrypt must come before it:

```node
app.use((request, response) => {
  response.send('Catchall');
})

// or

app.get('*', (request, response) => {
  response.send('Catchall');
});
```

