module.exports = function(Medication) {
  Medication.validatesUniquenessOf('name');
};
