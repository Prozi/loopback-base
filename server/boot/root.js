'use strict';

var firebase = require('firebase');

firebase.initializeApp({
  serviceAccount: 'firebase.creditentials.json',
  databaseURL: 'https://amber-heat-1073.firebaseio.com',
});

var database = firebase.database();

var normalizeValue = function(value) {
  value = parseInt(value || 0, 10);
  return isNaN(value) ? 0 : value;
};

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  router.get('/', server.loopback.status());
  router.get('/firebase/:medication', function (req, res) {
    var medication = req.params.medication;
    var viewsCount = database.ref('/views/count/' + medication);
    viewsCount.on('value', function(snapshot) {
      var value = normalizeValue(snapshot.val()) + 1;
      viewsCount.off('value');
      viewsCount.set(value);
      res.send(`{"${medication}":${value}}`);
    });
  });
  server.use(router);
};
