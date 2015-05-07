var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  uid: String,
  name: String,
  real_name: String,
  email: String,
  avatar: String,
  deleted: Boolean,
  chips: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chip'
  }]
});

mongoose.model('User', UserSchema);