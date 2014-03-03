var cluster = require('cluster'),
    master  = require('./lib/master'),
    worker  = require('./lib/worker');

module.exports = function(handler) {
  if (cluster.isMaster) {
    master();
  } else {
    worker(handler);
  }
};
