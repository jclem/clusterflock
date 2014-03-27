var cluster = require('cluster'),
    master  = require('./lib/master'),
    os      = require('os'),
    worker  = require('./lib/worker');

module.exports = function(handler, options) {
  options || (options = {});
  setDefaultOptions(options);

  if (cluster.isMaster) {
    master(options);
  } else {
    worker(handler, options);
  }
};

function setDefaultOptions(options) {
  if (!options.hasOwnProperty('numWorkers')) {
    options.numWorkers = os.cpus().length;
  }

  if (!options.hasOwnProperty('port')) {
    options.port = process.env.PORT || 5000;
  }

  if (!options.hasOwnProperty('timeout')) {
    options.timeout = 1000;
  }
}
