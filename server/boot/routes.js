'use strict';

module.exports = function(router) {
  var path = require('path');
  var home = function(req, res) {
    res.sendFile(path.resolve(router.path.view, 'index.html'));
  };
  router.get('/home', home);
  router.get('/search', home);
};