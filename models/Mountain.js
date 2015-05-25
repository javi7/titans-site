var mongoose = require('mongoose');

var mountainSchema = new mongoose.Schema({
  mountainName: {type: String, required: true, unique: true},
  js: {type: String, required: true},
  displayName: {type: String, required: true}
});

module.exports = Mountain = mongoose.model('Mountain', mountainSchema);