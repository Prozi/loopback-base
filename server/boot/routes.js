'use strict';

module.exports = function(router) {
  var path = require('path');
  var home = function(req, res) {
    res.sendFile(path.resolve(router.basePath, 'index.html'));
  };
  router.get('/home', home);
  router.get('/search', home);
}