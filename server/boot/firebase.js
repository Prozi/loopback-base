'use strict';

module.exports = (server) => {

  require('paint-console');

  const request  = require('request');
  const firebase = require('firebase');
  const fs       = require('fs');

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

    function maybeEnd(res, obj) {
      if (!--obj.waiting) {
        res.send(obj);
      }
    }

    function getImage(res, safe, obj) {
      request.get(`http://rximage.nlm.nih.gov/api/rximage/1/rxnav?name=${safe}&resolution=600`, (error, response, json) => {
        if (!error) {
          onGetImage(JSON.parse(json), obj);
        } else {
          console.log(error);
        }
        maybeEnd(res, obj);
      });
    }

    function getMoreInfo(res, safe, obj) {
      request.get(`https://rxnav.nlm.nih.gov/REST/Prescribe/drugs.json?name=${safe}`, (error, response, json) => {
        if (!error) {
          onGetMoreInfo(JSON.parse(json), obj);
        } else {
          console.log(error);
        }
        maybeEnd(res, obj);
      });
    }

    function onGetImage(json, obj) {
      if (json.nlmRxImages && json.nlmRxImages.length) {
        obj.image = json.nlmRxImages[0].imageUrl;
      }
    }

    function onGetMoreInfo(json, obj) {
      if (json.drugGroup) {
        if (json.drugGroup.conceptGroup) {
          obj.info = json.drugGroup.conceptGroup[1].conceptProperties[0].name;
        }
      }
    }

    // get stats
    router.get('/info/:medication', (req, res) => {
      let obj = { waiting: 3, info: null, image: null, count: null };
      let medication = req.params.medication.replace(/[\/\.#\$\[\]]/g, '');
      let viewsCount = database.ref('/views/count/' + medication);
      viewsCount.on('value', (snapshot) => {
        let key   = snapshot.key;
        let value = normalizeValue(snapshot.val()) + 1;
        viewsCount.off('value');
        viewsCount.set(value);
        obj.count = value;
        maybeEnd(res, obj);
      });
      getImage(res, medication, obj);
      getMoreInfo(res, medication, obj);
    });

    // get stats
    router.get('/firebase', (req, res) => {
      let viewsCount = database.ref('/views/count/');
      viewsCount.on('value', (snapshot) => {
        viewsCount.off('value');
        res.send(snapshot.val());
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
