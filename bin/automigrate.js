'use strict';

var app = require('../server/server');
var ds  = app.datasources.mongoDs;

ds.automigrate('Medication', function(err) {
  if (err) throw err;

  var medications = [
    {
      name: 'Paracetamol',
      producer: 'Jacek',
      price: 10
    }
  ];

  var count = medications.length;
  medications.forEach(function(medication) {
    app.models.Medication.create(medication, function(err, model) {
      if (err) throw err;

      console.log('Created:', JSON.stringify(model, null, 2));

      if (!--count) {
        ds.disconnect();
        process.exit();
      }
    });
  });
});
