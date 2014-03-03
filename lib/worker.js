var http   = require('http'),
    logfmt = require('./logfmt');

module.exports = function(handler, options) {
  logfmt.log({ evt: 'starting worker' });

  var server = http.createServer(handler);
  server.listen(options.port);

  setupSignalHandlers();
};

function setupSignalHandlers() {
  process.on('SIGINT', function() {
    logfmt.log({ evt: 'received SIGINT, sending myself SIGTERM' });
    process.kill(process.pid, 'SIGTERM');
  });

  process.on('SIGTERM', function() {
    logfmt.log({ evt: 'ignoring SIGTERM, waiting for master to disconnect' });
  });
}
