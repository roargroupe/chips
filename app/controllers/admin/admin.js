var express = require('express'),
  router = express.Router(),
  config;

var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Chip = mongoose.model('Chip'),
  Transaction = mongoose.model('Transaction');

var async = require('async'),
  request = require('request'),
  chips = require('../../utils/chips');

module.exports = function(app, cfg) {
  config = cfg;
  app.use('/admin', router);
};

router.get('/', function(req, res, next) {
  res.render('admin/index', {
    title: 'Dashboard'
  });
});

router.get('/users', function(req, res, next) {
  User.find({})
  .populate('transactions')
  .exec(function(err, users) {
    async.each(users, function(user, callback) {
      Transaction.populate(user.transactions, {
        'path': 'to from'
      }, callback);
    }, function done(err) {
      res.render('admin/users', {
        title: 'Users',
        users: users
      });
    });
  });
});

router.get('/users/leaderboard', function(req, res, next) {
  chips.leaderboard(config, function(leaderboard) {
    res.render('admin/leaderboard', {
      title: 'Leaderboard',
      leaderboard: leaderboard
    });
  }, res);
});

router.post('/users/import', function(req, res, next) {
  request('https://slack.com/api/users.list?token=' + config.slackToken, function (err, response, body) {
    if(!err && response.statusCode == 200) {
      var members = JSON.parse(body).members;
      async.each(members, function(member, callback) {
        var user = {
          uid: member.id,
          name: member.name,
          real_name: member.profile.real_name,
          email: member.profile.email,
          avatar: member.profile.image_192,
          deleted: member.deleted,
          active: (member.name == 'vinidy' || member.name == 'bernard' || member.name == 'johnathan.stewart' || member.name == 'robzand') ? true : false
        };

        User.findOneAndUpdate({'uid': user.uid}, user, {upsert: true}, callback);
      }, function done(err) {
        res.status(200).json({result: 'success'});
      });
    } else {
      res.status(200).json({result: err});
    }    
  });
});

router.post('/user/chip/:uid', function(req, res, next) {
  User.findOne({'uid': req.params.uid}, function(err, user) {
    if(err) {
      return res.status(200).json({result: err});
    }

    if(!user.active) {
      return res.status(200).json({result: 'This user is not active.'});
    }

    var chip = new Chip({'user': user._id});

    chip.save(function(err) {
      if(err) {
        res.status(200).json({result: err});
      } else {
        user.chips.push(chip);
        user.save(function(err) {
          if(err) {
            res.status(200).json({result: err});
          } else {
            res.status(200).json({result: 'success'});
          }
        });
      }
    });
  });
});

router.post('/user/activate/:uid', function(req, res, next) {
  User.findOneAndUpdate({'uid': req.params.uid}, {'active': true}, function(err, user) {
    if(err) {
      return res.json({result: err});
    }

    return res.json({result: 'success'});
  });
});

router.post('/user/deactivate/:uid', function(req, res, next) {
  User.findOneAndUpdate({'uid': req.params.uid}, {'active': false}, function(err, user) {
    if(err) {
      return res.json({result: err});
    }

    return res.json({result: 'success'});
  });
});

router.get('/chips', function(req, res, next) {
  User.find({'deleted': false, 'active': true}, function(err, users) {
    if(err) return next(err);
    res.render('admin/chips', {
      title: 'Chips',
      users: users
    });
  });
});

router.post('/chips/clear', function(req, res, next) {
  chips.clear(function() {
    return res.json({result: 'success'});
  });
});

router.post('/chip/command', function(req, res, next) {
  chips.send(config, config.testUserId, req.body.text, res);
});