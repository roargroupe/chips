var express = require('express'),
  router = express.Router(),
  config;

var chips = require('../utils/chips');

module.exports = function(app, cfg) {
  config = cfg;
  app.use('/api', router);
};

router.post('/chip', function(req, res, next) {
  chips.route(config, null, req, res, next);
});