'use strict';

require('paint-console');

let request = require('request');
let app     = require('../server/server');
let ds      = app.datasources.mongoDs;
let api     = 'https://rxnav.nlm.nih.gov/REST/';

let medications = [];
let createMedications = () => {
  // unique
  medications = [...new Set(medications)];
  let count = medications.length;
  let start = count + 0;
  console.info(`creating ${count} medication models in mongo`);
  console.info(`this will take a while (<5min)`);
  console.info(`we will tell you when we're over`);
  medications.forEach((medication) => {
    app.models.Medication.create(medication, (err, model) => {
      if (err) throw err;
      if (!--count) {
        ds.disconnect();
        console.info('importing drug list -> success');
        process.exit();
      } else {
        process.stdout.write(`\rprogress: ${start - count}/${start}`);
      }
    });
  });  
};

let termTypesCount = 0; 
let getTermTypes = () => {
  request.get(`${api}termtypes.json`, (err, res, json) => {
    if (err) throw err;
    let termType;
    json = JSON.parse(json);
    json.termTypeList.termType.forEach((item) => {
      termTypesCount++;
      getConcepts(item);
    });
  });  
};

let getConcepts = (termType) => {
  console.info(`getting concepts for term type: ${termType}`);
  request.get(`${api}allconcepts.json?tty=${termType}`, (err, res, json) => {
    if (err) throw err;
    let group, concept, medication;
    json = JSON.parse(json);
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
    if (!--termTypesCount) {
      createMedications();
    }
  });  
};

ds.automigrate('Medication', (err) => {
  if (err) throw err;
  console.info('importing drug list');
  getTermTypes();
});
