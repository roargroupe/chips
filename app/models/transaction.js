var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TransactionSchema = new Schema({  
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },    
    chip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chip'
    },
    direction: Number,
    created: Date,
    message: String
});

mongoose.model('Transaction', TransactionSchema);