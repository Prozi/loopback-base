'use strict';

let loopback = require('loopback');
let boot     = require('loopback-boot');
let path     = require('path');

const app = module.exports = loopback();

app.path = {};
app.path.base = path.resolve(__dirname, '..');
app.path.view = path.resolve(app.path.base, 'client');
app.set('views', app.path.view);

app.start = () => {
  // start the web server
  return app.listen(() => {
    app.emit('started');
    let baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      let explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, (err) => {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
