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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    direction: Number,
    chip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chip'
    },
    created: Date
  }]
});

mongoose.model('User', UserSchema);