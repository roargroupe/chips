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
      request({ 
        method: 'POST', 
        uri: 'https://hooks.slack.com/services/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', 
        body: JSON.stringify({
          'text':'*Weekly Leaderboard*',
          'parse':'full',
          'mrkdwn': true,
          'attachments':[{
            'text':'',
            'color':'#c6a256',
            'fields': [
              {
                'title': 'Received',
                'value': 'vinidy: 2\nbernard:1',
                'short': true
              },
              {
                'title': 'Sent',
                'value': 'bernard: 2\nvinidy:1',
                'short': true
              }
            ]
          }]         
        })
      });
    }, res);
  }
});