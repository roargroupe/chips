var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Chip = mongoose.model('Chip'),
  request = require('request'),
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
      console.log(members)

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

      res.json({result: 'pending'});
    } else {
      res.json({result: err});
    }    
  });
});

router.post('/users/activate/:uid', function(req, res, next) {
  User.findOneAndUpdate({'uid': req.params.uid}, {'active': true}, function(err, user) {
    if(err) {
      res.json({result: err});
    }

    res.json({result: 'success'});
  });
});

router.post('/users/deactivate/:uid', function(req, res, next) {
  User.findOneAndUpdate({'uid': req.params.uid}, {'active': false}, function(err, user) {
    if(err) {
      res.json({result: err});
    }

    res.json({result: 'success'});
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
      res.json({result: err});
    }

    var chip = new Chip({'user': user._id});      

    chip.save(function(err) {
      if(err) {
        res.json({result: err});
      } else {
        user.chips.push(chip);
        user.save(function(err) {
          if(err) {
            res.json({result: err});
          } else {
            res.json({result: 'success'});
          }
        });
      }
    });
  });
});

router.post('/chips/transfer/:from/:to/:amount', function(req, res, next) {
  if(req.params.from == req.params.to) {
    res.json({result: 'Cannot transfer to the same person.'});
  }

  User.findOne({'uid': req.params.from}).populate('chips').exec(function(err, fromUser) {
    if(err) {
      res.json({result: err});
    }

    if(!fromUser.active) {
      res.json({result: 'This user is not active.'});
    }

    if(fromUser.chips.length < req.params.amount) {
      res.json({result: 'This user does not have sufficient chips.'});
    }

    User.findOne({'uid': req.params.to}).populate('chips').exec(function(err, toUser) {
      if(err) {
        res.json({result: err});
      }

      if(!toUser.active) {
        res.json({result: 'This user is not active.'});
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
      
      res.json({result: 'success'});
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
    res.json({result: 'success'});
  });
});

// TODO: Find a better way to stack this so that you can return an actual success
// TODO: Make use of function for giving someone a chip instead of doing it here (don't populate transaction fields though)
router.post('/chips/start', function(req, res, next) {
  clearChips(function() {
    User.find({'deleted': false, 'active': true}, function(err, users) {
      if(err) {
        res.json({result: err});
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

  res.json({result: 'pending'});
});