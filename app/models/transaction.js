var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TransactionSchema = new Schema({  
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }, 
    chip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chip'
    },    
    created: Date,
    message: String
});

mongoose.model('Transaction', TransactionSchema);