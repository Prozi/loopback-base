'use strict';

require('paint-console');

var request = require('request');
var rxnorm  = require('rxnorm-js');
var app     = require('../server/server');
var ds      = app.datasources.mongoDs;
var api     = 'https://rxnav.nlm.nih.gov/REST/allconcepts.json?tty=BN';

ds.automigrate('Medication', function(err) {
  if (err) throw err;

  console.info('importing drug list');

  request.get(api, function(err, res, json) {
    if (err) throw err;

    json = JSON.parse(json);

    var medications = [];
    var group, concept, medication;

    for (group in json.minConceptGroup) {
      if (json.minConceptGroup.hasOwnProperty(group)) {
        for (concept in json.minConceptGroup[group]) {
          if (json.minConceptGroup[group].hasOwnProperty(concept)) {
            medication = json.minConceptGroup[group][concept];
            medications.push({
              name  : medication.name,
              rxcui : medication.rxcui
            });
          }
        }
      }
    }

    var count = medications.length;
    medications.forEach(function(medication) {
      app.models.Medication.create(medication, function(err, model) {
        if (err) throw err;

        if (!--count) {
          ds.disconnect();
          console.info('importing drug list -> success');
          process.exit();
        }
      });
    });
  });

});
