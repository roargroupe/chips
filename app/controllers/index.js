var express = require('express'),
  router = express.Router(),
  config;

module.exports = function(app, cfg) {  
  config = cfg;
  app.use('/', router);  
};

router.get('/', function(req, res, next) {
  res.redirect(301, '/admin');
});
