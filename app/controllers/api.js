var express = require('express'),
  router = express.Router(),
  config;

var chips = require('../utils/chips');

module.exports = function(app, cfg) {
  config = cfg;
  app.use('/api', router);
};

router.post('/chip', function(req, res, next) {
  if(req.body.token != config.slackOutgoingToken) {
    return res.status(200).json({result: 'Who is this?'});
  }

  if(body.search('@') == 0) {
    chips.send(config, req.body.user_id, req.body.text, res);
  } else if(body.search('leaderboard') > 0) {
    // slack /chip leaderboard
    chips.leaderboard(config, function(leaderboard) {
      var received = '';
      var sent = '';

      for(var i = 0; i < leaderboard.received.length; i++) {
        received += leaderboard.received[i].user.name + ': ' + leaderboard.received[i].count;

        if(i < leaderboard.received.length - 1) {
          received += ', ';
        } else {
          received += '.';
        }
      }

      for(var i = 0; i < leaderboard.sent.length; i++) {
        sent += leaderboard.sent[i].user.name + ': ' + leaderboard.sent[i].count;

        if(i < leaderboard.sent.length - 1) {
          sent += ', ';
        } else {
          sent += '.';
        }
      }

      res.status(200).send('Weekly Leaderboard! Most chips received: ' + received + ' Most chips sent: ' + sent);
    }, res);
  }
});