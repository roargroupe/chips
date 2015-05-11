var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Chip = mongoose.model('Chip'),
  request = require('request'),
  moment = require('moment'),
  config = require('../../config/config');  

module.exports = function(app) {  
  app.use('/', router);  
};

router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Chips Dashboard'
  });
});

router.get('/users', function(req, res, next) {
  User.find({'deleted': false, 'active': true}).populate('transactions.user').exec(function(err, users) {
    if(err) return next(err);
    res.render('users', {
      title: 'Chips Users',
      users: users
    });
  });
});

router.get('/users/all', function(req, res, next) {
  User.find({}, function(err, users) {
    if(err) return next(err);
    res.render('users', {
      title: 'Chips Users',
      users: users
    });
  });
});

router.post('/users/import', function(req, res, next) {
  request('https://slack.com/api/users.list?token=' + config.slackToken, function (err, response, body) {
    if(!err && response.statusCode == 200) {
      var members = JSON.parse(body).members;

      members.forEach(function(member) {
        var user = {
          uid: member.id,
          name: member.name,
          real_name: member.profile.real_name,
          email: member.profile.email,
          avatar: member.profile.image_192,
          deleted: member.deleted,
          active: true
        };

        User.findOneAndUpdate({'uid': user.uid}, user, {upsert: true}, function(err) {});
      });

      return res.json({result: 'pending'});
    } else {
      return res.json({result: err});
    }    
  });
});

router.post('/users/activate/:uid', function(req, res, next) {
  User.findOneAndUpdate({'uid': req.params.uid}, {'active': true}, function(err, user) {
    if(err) {
      return res.json({result: err});
    }

    return res.json({result: 'success'});
  });
});

router.post('/users/deactivate/:uid', function(req, res, next) {
  User.findOneAndUpdate({'uid': req.params.uid}, {'active': false}, function(err, user) {
    if(err) {
      return res.json({result: err});
    }

    return res.json({result: 'success'});
  });
});

router.get('/chips/transfer', function(req, res, next) {
  User.find({'deleted': false, 'active': true}, function(err, users) {
    if(err) return next(err);
    res.render('transfer', {
      title: 'Transfer Chips',
      users: users
    });
  });
});

router.post('/chips/give/:uid', function(req, res, next) {
  User.findOne({'uid': req.params.uid}, function(err, user) {
    if(err) {
      return res.json({result: err});
    }

    var chip = new Chip({'user': user._id});      

    chip.save(function(err) {
      if(err) {
        return res.json({result: err});
      } else {
        user.chips.push(chip);
        user.save(function(err) {
          if(err) {
            return res.json({result: err});
          } else {
            return res.json({result: 'success'});
          }
        });
      }
    });
  });
});

router.post('/chips/transfer/:from/:to/:amount', function(req, res, next) {
  if(req.params.from == req.params.to) {
    return res.json({result: 'Cannot transfer to the same person.'});
  }

  User.findOne({'uid': req.params.from}).populate('chips').exec(function(err, fromUser) {
    if(err) {
      return res.json({result: err});
    }

    if(!fromUser.active) {
      return res.json({result: 'This user is not active.'});
    }

    if(fromUser.chips.length < req.params.amount) {
      return res.json({result: 'This user does not have sufficient chips.'});
    }

    User.findOne({'uid': req.params.to}).populate('chips').exec(function(err, toUser) {
      if(err) {
        return res.json({result: err});
      }

      if(!toUser.active) {
        return res.json({result: 'This user is not active.'});
      }
      
      for(var i = 0; i < req.params.amount; i++) {
        var chip = fromUser.chips.pop();

        chip.user._id = toUser._id;
        chip.save();

        toUser.chips.push(chip);
      }

      fromUser.transactions.push({
        user: toUser._id,
        direction: config.directions.SENT,
        chip: chip._id,
        created: Date.now()
      });

      toUser.transactions.push({
        user: fromUser._id,
        direction: config.directions.RECEIVED,
        chip: chip._id,
        created: Date.now()
      });

      fromUser.save();
      toUser.save();
      
      return res.json({result: 'success'});
    });
  });
});

function clearChips(callback) {
  Chip.remove({}, function(err, chips) {
    User.update({}, {$set: {chips: []}}, {multi: true}, function(err, users) {
      callback();
    });
  });
}

router.post('/chips/clear', function(req, res, next) {
  clearChips(function() {
    return res.json({result: 'success'});
  });
});

// TODO: Find a better way to stack this so that you can return an actual success
// TODO: Make use of function for giving someone a chip instead of doing it here (don't populate transaction fields though)
router.post('/chips/start', function(req, res, next) {
  clearChips(function() {
    User.find({'deleted': false, 'active': true}, function(err, users) {
      if(err) {
        return res.json({result: err});
      }

      users.forEach(function(user) {
        var chips = [];

        for(var j = 0; j < config.chipsAtStart; j++) {
          var chip = new Chip({'user': user._id});
          chip.save();

          chips.push(chip);
        }

        user.chips = chips;
        user.save();
      });
    });
  });

  return res.json({result: 'pending'});
});

function sendChips(token, reqFromUserId, text, res) {
  // TODO kill everything after the @mention for now
  if(token != config.slackOutgoingToken) {
    return res.status(200).json({result: 'Who is this?'});
  }

  var fromUserId = reqFromUserId;
  var body = text;

  var pattern = /\B@[.a-z0-9_-]+/gi;
  var mentions = body.match(pattern);
  
  User.findOne({'uid': fromUserId}).populate('chips').exec(function(err, fromUser) {
    if(err) {
      return res.status(200).send('Hmmm, there seems to be something wrong with the server. Please try again later.');
    }

    if(!fromUser.active) {
      return res.status(200).send('You cannot send chips because you are not currently an active user.');
    }

    if(!fromUser.chips.length) {
      return res.status(200).send("You don't have enough chips to send.");
    }

    mentions.forEach(function(mention, index) {
      User.findOne({'name': mention.replace('@','')}).populate('chips').exec(function(err, toUser) {
        if(err) {
          return res.status(200).send('Hmmm, there seems to be something wrong with the server. Please try again later.');
        }        

        if(toUser == null) {          
          return res.status(200).send("We couldn't find " + mention + ".");
        }

        if(fromUser.uid == toUser.uid) {
          return res.status(200).send("Nice try, but you can't transfer a chip to yourself.");
        }

        if(!toUser.active) {
          return res.status(200).send('@' + toUser.name + ' is not an active user.');
        }

        var chip = fromUser.chips.pop();

        chip.user._id = toUser._id;
        chip.save();

        toUser.chips.push(chip);

        fromUser.transactions.push({
          user: toUser._id,
          direction: config.directions.SENT,
          chip: chip._id,
          created: Date.now()
        });

        toUser.transactions.push({
          user: fromUser._id,
          direction: config.directions.RECEIVED,
          chip: chip._id,
          created: Date.now()
        });

        fromUser.save();
        toUser.save();

        request.post('https://slack.com/api/chat.postMessage').form({
          token: config.slackToken,
          link_names: 1,
          channel: '#chips',
          text: mention + ' has been chipped!',
          icon_emoji: ':heart_eyes_cat:'
        });

        var week = fromUser.transactions.filter(function(elem) {
          return moment(elem.created).isAfter(moment().day("Monday").startOf('day'));
        });

        var sent = week.filter(function(elem) {
          return (elem.direction == config.directions.SENT);
        });

        if(index == mentions.length - 1) {
          return res.status(200).send(mentions.join(', ') + ' ha' + (mentions.length == 1 ? 's' : 've' ) + ' been chipped! You have ' + fromUser.chips.length + ' chip' + (fromUser.chips.length == 1 ? '' : 's' ) + ' left. You have sent ' + sent.length + ' chip' + (sent.length == 1 ? '' : 's' ) + ' and received ' + (week.length - sent.length) + ' chip' + ((week.length - sent.length) == 1 ? '' : 's' ) + ' this week.');
        }
      });
    });
  });
}

router.post('/chip', function(req, res, next) {
  sendChips(req.body.token, req.body.user_id, req.body.text, res);
});

router.post('/chip/local/', function(req, res, next) {
  sendChips(config.slackOutgoingToken, config.testUserId, req.body.text, res);
});