var cluster = require('cluster'),
    master  = require('./lib/master'),
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
  options.port || (options.port = process.env.PORT || 5000);
  options.timeout = options.timeout > 0 ? options.timeout : 1000;
}
