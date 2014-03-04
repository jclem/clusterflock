require('./spec-helper');

var proxyquire = require('proxyquire');

describe('worker', function() {
  var logfmt,
      http,
      worker,
      handler;

  beforeEach(function() {
    logfmt  = {};
    http    = {};
    worker  = proxyquire('../lib/worker', { './logfmt': logfmt, 'http': http });
    handler = function(){};
    logfmt.log = function(){};
    http.Server.prototype.listen = function(){};
  });

  it('logs its start event', function() {
    spyOn(logfmt, 'log');
    worker(handler, {});
    expect(logfmt.log).toHaveBeenCalledWith({ evt: 'starting worker' });
  });

  it('creates a server with the given handler', function() {
    spyOn(http, 'createServer').andCallThrough();
    worker(handler, {});
    expect(http.createServer).toHaveBeenCalledWith(handler);
  });

  it('listens on the given port', function() {
    spyOn(http.Server.prototype, 'listen');
    worker(handler, { port: 1 });
    expect(http.Server.prototype.listen).toHaveBeenCalledWith(1)
  });

  it('traps and logs SIGINT once', function() {
    worker(handler, {});
    spyOn(logfmt, 'log');
    process.emit('SIGINT');
    expect(logfmt.log).toHaveBeenCalledWith({ evt: 'received SIGINT, immediately shutting down' });
  });

  it('does not handle subsequent SIGINTs', function() {
    worker(handler, {});
    process.emit('SIGINT');
    process.kill.reset();
    process.emit('SIGINT');
    expect(process.kill).not.toHaveBeenCalledWith(process.pid, 'SIGINT');
  });

  it('traps and logs SIGTERM', function() {
    worker(handler, {});
    spyOn(logfmt, 'log');
    process.emit('SIGTERM');
    expect(logfmt.log).toHaveBeenCalledWith({ evt: 'ignoring SIGTERM, waiting for master to disconnect' })
  });
});
