var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'chips'
    },
    port: 3000,
    db: 'mongodb://localhost/chips-development',
    slackToken: 'xoxp-2358143428-3992166299-4757109184-f103d9',
    chipsAtStart: 3
  },

  test: {
    root: rootPath,
    app: {
      name: 'chips'
    },
    port: 3000,
    db: 'mongodb://localhost/chips-test',
    slackToken: 'xoxp-2358143428-3992166299-4757109184-f103d9',
    chipsAtStart: 3
  },

  production: {
    root: rootPath,
    app: {
      name: 'chips'
    },
    port: 3000,
    db: 'mongodb://localhost/chips-production',
    slackToken: 'xoxp-2358143428-3992166299-4757109184-f103d9',
    chipsAtStart: 3
  }
};

module.exports = config[env];
