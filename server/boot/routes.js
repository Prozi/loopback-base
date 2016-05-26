'use strict';

module.exports = (router) => {
  let path = require('path');
  let home = (req, res) => {
    res.sendFile(path.resolve(router.path.view, 'index.html'));
  };
  router.get('/home', home);
  router.get('/search', home);
};