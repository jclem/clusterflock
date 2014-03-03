var cluster = require('cluster'),
    logfmt  = require('./logfmt'),
    os      = require('os');

module.exports = function() {
  logfmt.log({ evt: 'starting master' });

  for (var i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  cluster.on('disconnect', function(worker) {
    if (!worker.suicide) {
      cluster.fork();
    }
  });

  setupSignalHandlers();
};

function setupSignalHandlers() {
  process.on('SIGINT', function() {
    logfmt.log({ evt: 'received SIGINT, sending myself SIGTERM' });
    process.kill(process.pid, 'SIGTERM');
  });

  process.on('SIGTERM', function() {
    logfmt.log({ evt: 'received SIGTERM, sending myself SIGQUIT' });
    process.kill(process.pid, 'SIGQUIT');
  });

  process.on('SIGQUIT', function() {
    logfmt.log({ evt: 'received SIGQUIT, attempting graceful shutdown' });

    setTimeout(function() {
      logfmt.log({ evt: 'timeout exceeded, forcing shutdown' });

      eachWorker(function(worker) {
        worker.kill();
      });

      process.kill();
    }, 1000).unref();

    cluster.disconnect(function() {
      logfmt.log({ evt: 'all workers disconnected' });
    });
  });
}

function eachWorker(fn) {
  for (var i in cluster.workers) {
    fn(cluster.workers[i]);
  }
}
