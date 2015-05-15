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
    testUserId: 'U02AJ47CN'//'U03V64W8T'
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
    testUserId: 'U03V64W8T'
  },

  error: {
    serverError: 'Hmmm, there seems to be something wrong with the server. Please try again later.'
  }
};

module.exports = config[env];
