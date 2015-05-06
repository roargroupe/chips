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
    db: 'mongodb://localhost/chips-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'chips'
    },
    port: 3000,
    db: 'mongodb://localhost/chips-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'chips'
    },
    port: 3000,
    db: 'mongodb://localhost/chips-production'
  }
};

module.exports = config[env];
