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
  if (needsKey('numWorkers')) {
    options.numWorkers = os.cpus().length;
  }

  if (needsKey('port')) {
    options.port = process.env.PORT || 5000;
  }

  if (needsKey('timeout')) {
    options.timeout = 1000;
  }

  function needsKey(key) {
    return Object.keys(options).indexOf(key) === -1
  }
}
