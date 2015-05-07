var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ChipSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Chip', ChipSchema);