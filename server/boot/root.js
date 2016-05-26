'use strict';

module.exports = (server) => {
  var router = server.loopback.Router();
  router.get('/status', server.loopback.status());
  server.use(router);
};
