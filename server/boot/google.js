'use strict';

module.exports = function(server) {

  require('paint-console');

  var fs                = require('fs');
  var creditentialsPath = 'google-search.creditentials.json';
  var where             = `inside project root: '${creditentialsPath}'`;

  var errorMessage = `
    You should put your google search creditentials from:
    https://console.developers.google.com/apis/credentials
    ${where}
    (format: { id, apiKey })
  `;
  var successMessage = `
    Success: Initialized google image search.
    Found google search creditentials
    ${where}
  `;

  fs.exists(creditentialsPath, function(exists) {
      if (exists) {
        try {
          initGoogleImages(server);
        } catch (e) {
          console.error(e);
        }
      } else {
        console.error(errorMessage);        
      }
  });

  function initGoogleImages(server) {
 
    var path   = require('path');
    var google = require('googleapis');

    var creditentials = require(path.resolve(server.path.base, creditentialsPath));
    var makeQuery = function (query) {
      return {
        cx    : creditentials.id,
        key   : creditentials.apiKey,
        image : true,
        q     : query
      };
    };

    var router = server.loopback.Router();
    var search = google.customsearch('v1');

    router.get('/google/:medication', function(req, res) {
      var medication = req.params.medication.replace(/-/g, ' ');

      search.cse.list(makeQuery(medication), function (err, body) {
        // Daily quota exceeded?
        if (err) {
          res.sendStatus(500);
        } else {
          if (body && body.items && body.items.length && body.items[0].pagemap && body.items[0].pagemap.imageobject && body.items[0].pagemap.imageobject.length) {
            res.send(body.items[0].pagemap.imageobject[0].contenturl);
          } else {
            res.sendStatus(404);
          }
        }
      });
    });

    console.info(successMessage);

    server.use(router);

  }

};
