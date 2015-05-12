var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserSchema = new Schema({
  uid: String,
  name: String,
  real_name: String,
  email: String,
  avatar: String,
  deleted: Boolean,
  active: { 
  	type: Boolean, 
  	default: true 
  },
  chips: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chip'
  }],
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }]
});

mongoose.model('User', UserSchema);