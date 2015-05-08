var mongoose = require('mongoose');

var subscriberSchema = new mongoose.Schema({
  email: {type: String, required: true, unique: true}
});

module.exports = Subscriber = mongoose.model('Subscriber', subscriberSchema);