'use strict';

module.exports = function(server) {

  require('paint-console');

  var firebase = require('firebase');
  var fs       = require('fs');

  var creditentialsPath = 'firebase.creditentials.json';
  var where             = `inside project root: '${creditentialsPath}'`;

  var errorMessage = `
    You should put your firebase creditentials from json:
    https://firebase.google.com/docs/auth/web/custom-auth#before-you-begin
    ${where}
  `;
  var successMessage = `
    Success: Initialized firebase.
    Found firebase creditentials
    ${where}
  `;

  fs.exists(creditentialsPath, function(exists) {
      if (exists) {
        initFirebase(server);
      } else {
        console.error(errorMessage);        
      }
  });

  function initFirebase(server) {

    firebase.initializeApp({
      serviceAccount: creditentialsPath,
      databaseURL: 'https://amber-heat-1073.firebaseio.com',
    });

    var router   = server.loopback.Router();
    var database = firebase.database();

    var normalizeValue = function(value) {
      value = parseInt(value || 0, 10);
      return isNaN(value) ? 0 : value;
    };

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

    console.info(successMessage);

  }

}
