var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ChipSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  active: { 
  	type: Boolean, 
  	default: true 
  }
});

mongoose.model('Chip', ChipSchema);