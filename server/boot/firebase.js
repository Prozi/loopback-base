'use strict';

module.exports = (server) => {

  require('paint-console');

  let firebase = require('firebase');
  let fs       = require('fs');

  const creditentialsPath = 'firebase.creditentials.json';
  const where             = `inside project root: '${creditentialsPath}'`;

  const errorMessage = `
    You should put your firebase creditentials from json:
    https://firebase.google.com/docs/auth/web/custom-auth#before-you-begin
    ${where}
  `;
  const successMessage = `
    Success: Initialized firebase.
    Found firebase creditentials
    ${where}
  `;

  let initFirebase = (server) => {

    let creditentials = require(`${__dirname}/../../${creditentialsPath}`);

    firebase.initializeApp({
      serviceAccount: creditentialsPath,
      databaseURL: `https://${creditentials.project_id}.firebaseio.com`,
    });

    let router   = server.loopback.Router();
    let database = firebase.database();

    let normalizeValue = (value) => {
      value = parseInt(value || 0, 10);
      return isNaN(value) ? 0 : value;
    };

    // get stats
    router.get('/firebase', (req, res) => {
      let viewsCount = database.ref('/views/count/');
      viewsCount.on('value', (snapshot) => {
        viewsCount.off('value');
        res.send(snapshot.val());
      });
    });

    // update stats
    router.post('/firebase/:medication', (req, res) => {
      let medication = req.params.medication.replace(/[\/\.#\$\[\]]/g, '');
      let viewsCount = database.ref('/views/count/' + medication);
      viewsCount.on('value', (snapshot) => {
        let key   = snapshot.key;
        let value = normalizeValue(snapshot.val()) + 1;
        viewsCount.off('value');
        viewsCount.set(value);
        res.send(`{"${key}":${value}}`);
      });
    });

    console.info(successMessage);

    server.use(router);

  };

  fs.exists(creditentialsPath, (exists) => {
      if (exists) {
        initFirebase(server);
      } else {
        console.error(errorMessage);        
      }
  });

};
