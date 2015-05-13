(function () {

    var chips = {};

    var mongoose = require('mongoose'),
      User = mongoose.model('User'),
      Chip = mongoose.model('Chip'),
      Transaction = mongoose.model('Transaction');

    var request = require('request'),
      moment = require('moment');

    chips.clear = function(callback) {
      Chip.remove({}, function(err, chips) {
        User.update({}, {$set: {chips: []}}, {multi: true}, function(err, users) {
          callback();
        });
      });
    };

    chips.send = function(config, token, reqFromUserId, text, res) {
      
      if(token != config.slackOutgoingToken) {
        return res.status(200).json({result: 'Who is this?'});
      }
      
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

          var toTransaction = new Transaction({
            'user': toUser._id,
            'chip': chip._id,
            'direction': config.directions.RECEIVED,
            'created': Date.now(),
            'message': message
          });

          var fromTransaction = new Transaction({
            'user': fromUser._id,
            'chip': chip._id,
            'direction': config.directions.SENT,
            'created': Date.now(),
            'message': message
          });

          toTransaction.save();
          fromTransaction.save();

          toUser.transactions.push(toTransaction);
          fromUser.transactions.push(fromTransaction);
          
          toUser.save();
          fromUser.save();
          
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

          var week = fromUser.transactions.filter(function(elem) {
            return moment(elem.created).isAfter(moment().day('Monday').startOf('day'));
          });

          var sent = week.filter(function(elem) {
            return (elem.direction == config.directions.SENT);
          });

          return res.status(200).send(mention + ' has been chipped! You have ' + fromUser.chips.length + ' chip' + (fromUser.chips.length == 1 ? '' : 's' ) + ' left. You have sent ' + sent.length + ' chip' + (sent.length == 1 ? '' : 's' ) + ' and received ' + (week.length - sent.length) + ' chip' + ((week.length - sent.length) == 1 ? '' : 's' ) + ' this week.');
        });
      });
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = chips;
    }

}());
