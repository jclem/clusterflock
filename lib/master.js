var cluster = require('cluster'),
    logfmt  = require('./logfmt');

module.exports = function(options) {
  logfmt.log({ evt: 'starting master' });

  for (var i = 0; i < options.numWorkers; i++) {
    cluster.fork();
  }

  cluster.on('listening', function() {
    if (!this.listening) {
      logfmt.log({ evt: 'clusterflock is listening on port ' + options.port });
    }

    this.listening = true;
  });

  cluster.on('disconnect', function(worker) {
    logfmt.log({ evt: 'worker (pid ' + worker.process.pid + ') disconnected' });

    if (!worker.suicide) {
      cluster.fork();
    }
  });

  setupSignalHandlers(options);
};

function setupSignalHandlers(options) {
  var isShuttingDown;

  process.on('SIGTTIN', function() {
    logfmt.log({ evt: 'received TTIN, forking additional worker' });
    cluster.fork();
  });

  process.on('SIGTTOU', function() {
    logfmt.log({ evt: 'received TTOU, removing worker' });
    var worker = cluster.workers[Object.keys(cluster.workers)[0]];
    worker.disconnect();
  });

  process.once('SIGINT', function() {
    logfmt.log({ evt: 'received SIGINT, immediately shutting down' });
    process.kill(process.pid, 'SIGINT');
  });

  process.on('SIGTERM', function() {
    if (isShuttingDown) {
      logfmt.log({ evt: 'received SIGTERM, ignoring (already shutting down)' });
    } else {
      logfmt.log({ evt: 'received SIGTERM, sending myself SIGQUIT' });
      process.kill(process.pid, 'SIGQUIT');
    }
  });

  process.on('SIGQUIT', function() {
    if (isShuttingDown) {
      logfmt.log({ evt: 'received SIGQUIT, ignoring (already shutting down)' });
    } else {
      logfmt.log({ evt: 'received SIGQUIT, attempting graceful shutdown' });

      isShuttingDown = true;

      setTimeout(function() {
        logfmt.log({ evt: 'timeout exceeded, forcing shutdown' });

        eachWorker(function(worker) {
          worker.kill();
        });

        process.kill();
      }, options.timeout).unref();

      cluster.disconnect(function() {
        logfmt.log({ evt: 'all workers disconnected' });
      });
    }
  });
}

function eachWorker(fn) {
  for (var i in cluster.workers) {
    fn(cluster.workers[i]);
  }
}
