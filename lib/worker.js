var cluster = require('cluster'),
    http    = require('http'),
    logfmt  = require('./logfmt');

module.exports = function(handler) {
  logfmt.log({ evt: 'starting worker' });
  var server = http.createServer(handler);
  server.listen(process.env.PORT || 5000);

  setupSignalHandlers();
};

function setupSignalHandlers() {
  process.on('SIGINT', function() {
    logfmt.log({ evt: 'received SIGINT, sending myself SIGTERM' });
    process.kill(process.pid, 'SIGTERM');
  });

  process.once('SIGTERM', function() {
    logfmt.log({ evt: 'received SIGTERM, waiting for master to send SIGQUIT' });
  });
}
