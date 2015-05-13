var express = require('express'),
  router = express.Router(),
  config;

var chips = require('../utils/chips');

module.exports = function(app, cfg) {
  config = cfg;
  app.use('/api', router);
};

router.post('/chip', function(req, res, next) {
  chips.send(config, req.body.token, req.body.user_id, req.body.text, res);
});