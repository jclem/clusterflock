var cluster = require('cluster'),
    master  = require('./lib/master'),
    worker  = require('./lib/worker');

module.exports = function(handler, options) {
  options || (options = {});

  if (cluster.isMaster) {
    master(options);
  } else {
    worker(handler, options);
  }
};
