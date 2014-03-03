var cluster = require('cluster'),
    http    = require('http'),
    logfmt  = require('./logfmt');

module.exports = function(handler, options) {
  var port   = options.port || process.env.PORT || 5000,
      server = http.createServer(handler);

  logfmt.log({ evt: 'starting worker' });
  server.listen(port);

  setupSignalHandlers();
};

function setupSignalHandlers() {
  process.on('SIGINT', function() {
    logfmt.log({ evt: 'received SIGINT, sending myself SIGTERM' });
    process.kill(process.pid, 'SIGTERM');
  });

  process.once('SIGTERM', function() {
    logfmt.log({ evt: 'ignoring SIGTERM, waiting for master to disconnect' });
  });
}
