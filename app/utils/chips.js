(function () {

  var chips = {};

  var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Chip = mongoose.model('Chip'),
    Transaction = mongoose.model('Transaction');

  var async = require('async'),
    request = require('request'),
    moment = require('moment');

  chips.clear = function(callback) {
    Chip.remove({}, function(err, chips) {
      User.update({}, {$set: {chips: []}}, {multi: true}, function(err, users) {
        callback();
      });
    });
  }

  chips.send = function(config, reqFromUserId, text, res) {      
    var fromUserId = reqFromUserId;
    var body = text;

    var pattern = /^\B@[.a-z0-9_-]+/gi;
    var mention = body.match(pattern)[0];
    var message = (body.slice(mention.length)).trim();
    
    User.findOne({'uid': fromUserId}).populate('chips transactions').exec(function(err, fromUser) {
      if(err) {
        // TODO move generic error messages into config
        return res.status(200).send('Hmmm, there seems to be something wrong with the server. Please try again later.');
      }

      if(!fromUser.active) {
        return res.status(200).send('You cannot send chips because you are not currently an active user.');
      }

      if(!fromUser.chips.length) {
        return res.status(200).send("You don't have any more chips to chip.");
      }
      
      User.findOne({'name': mention.replace('@','')}).populate('chips transactions').exec(function(err, toUser) {
        if(err) {
          return res.status(200).send('Hmmm, there seems to be something wrong with the server. Please try again later.');
        }        

        if(toUser == null) {          
          return res.status(200).send("We couldn't find " + mention + ".");
        }

        if(fromUser.uid == toUser.uid) {
          return res.status(200).send("Nice try, but you can't chip yourself.");
        }

        if(!toUser.active) {
          return res.status(200).send(mention + ' is not an active user.');
        }
        
        var chip = fromUser.chips.pop();

        chip.user._id = toUser._id;
        chip.save();

        toUser.chips.push(chip);

        var transaction = new Transaction({
          'from': fromUser._id,
          'to': toUser._id,
          'chip': chip._id,
          'created': Date.now(),
          'message': message
        });

        transaction.save();

        toUser.transactions.push(transaction);
        fromUser.transactions.push(transaction);
        
        toUser.save();
        fromUser.save();

        var received = 0; 
        var sent = 0;

        // TODO find a smarter way to aggregate the info you need at the same time
        Transaction.aggregate([
          {$match: {to: new mongoose.Types.ObjectId(fromUser._id), created: {$gt: new Date(moment().day('Monday').startOf('day').toDate())}}},
          {$group: {_id: null, count: {$sum: 1}}},
          {$project: {_id: 0, count: '$count'}}], 
          function(err, result) {
            if(result.length) {
              received = result[0].count || 0;
            }              
          
            Transaction.aggregate([
              {$match: {from: new mongoose.Types.ObjectId(fromUser._id), created: {$gt: new Date(moment().day('Monday').startOf('day').toDate())}}},
              {$group: {_id: null, count: {$sum: 1}}}, 
              {$project: {_id: 0, count: '$count'}}],
              function(err, result) {
                if(result.length) {
                  sent = result[0].count || 0;
                }
              
                request({ 
                  method: 'POST', 
                  uri: 'https://hooks.slack.com/services/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', 
                  body: JSON.stringify({
                    'text':'*' + mention + ' has been chipped!*',
                    'parse':'full',
                    'mrkdwn': true,
                    'attachments':[{
                      'text':message,
                      'color':'#c6a256'
                    }]         
                  })
                });

                return res.status(200).send(mention + ' has been chipped! You have ' + fromUser.chips.length + ' chip' + (fromUser.chips.length == 1 ? '' : 's' ) + ' left. You have sent ' + sent + ' chip' + (sent == 1 ? '' : 's' ) + ' and received ' + received + ' chip' + (received == 1 ? '' : 's' ) + ' this week.');        
              }
            );
          }
        );
      });
    });
  }

  chips.leaderboard = function(config, callback, res) {
    // TODO find cheeky workaround for aggregate->populate in mongo/mongoose
    Transaction.aggregate([        
      {$match: {created: {$gt: new Date(moment().day('Monday').startOf('day').toDate())}}},
      {$group: {_id: '$to', count: {$sum: 1}}},
      {$sort: {count: -1}}],
      function(err, resultReceived) {
        Transaction.aggregate([
          {$match: {created: {$gt: new Date(moment().day('Monday').startOf('day').toDate())}}},
          {$group: {_id: '$from', count: {$sum: 1}}},
          {$sort: {count: -1}}],
          function(err, resultSent) {
            async.parallel({
              received: function(parallelCallback) {
                async.each(resultReceived, function(user, callback) {
                  User.findOne({'_id': user._id}, function(err, u) {
                    user.user = u;
                    callback();
                  });
                }, function done(err) {
                  parallelCallback(null, resultReceived);
                });
              },
              sent: function(parallelCallback){
                async.each(resultSent, function(user, callback) {
                  User.findOne({'_id': user._id}, function(err, u) {
                    user.user = u;
                    callback();
                  });
                }, function done(err) {
                  parallelCallback(null, resultSent);
                });
              }
            },
            function(err, results) {
              callback(results);
            });              
          }
        );
      }
    );
  }

  if (typeof module !== 'undefined' && module.exports) {
      module.exports = chips;
  }

}());
