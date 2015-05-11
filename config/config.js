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
    slackOutgoingToken: 'XqaWepkEfNQnVqZdJSHT39NY',
    chipsAtStart: 3,
    directions: {
      SENT: 0,
      RECEIVED: 1
    },
    testUserId: 'U03V64W8T'
  },

  test: {
    root: rootPath,
    app: {
      name: 'chips'
    },
    port: 3000,
    db: 'mongodb://localhost/chips-test',
    slackToken: 'xoxp-2358143428-3992166299-4757109184-f103d9',
    slackOutgoingToken: 'XqaWepkEfNQnVqZdJSHT39NY',
    chipsAtStart: 3,
    directions: {
      SENT: 0,
      RECEIVED: 1
    },
    testUserId: 'U03V64W8T'
  },

  production: {
    root: rootPath,
    app: {
      name: 'chips'
    },
    port: process.env.PORT || 3000,
    db: process.env.MONGOLAB_URI,
    slackToken: 'xoxp-2358143428-3992166299-4757109184-f103d9',
    slackOutgoingToken: 'XqaWepkEfNQnVqZdJSHT39NY',
    chipsAtStart: 3,
    directions: {
      SENT: 0,
      RECEIVED: 1
    },
    testUserId: 'U03V64W8T'
  }
};

module.exports = config[env];
