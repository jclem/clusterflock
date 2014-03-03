require('./spec-helper');

var emitter    = require('events').EventEmitter,
    proxyquire = require('proxyquire');

describe('master', function() {
  var logfmt,
      cluster,
      master;

  beforeEach(function() {
    logfmt = { log: function(){} }
    cluster = new emitter;
    cluster.disconnect = jasmine.createSpy();
    cluster.fork = jasmine.createSpy();
    cluster['@noCallThru'] = true
    master = proxyquire('../lib/master', { './logfmt': logfmt, 'cluster': cluster });
  });

  it('logs its start event', function() {
    spyOn(logfmt, 'log');
    master({});
    expect(logfmt.log).toHaveBeenCalledWith({ evt: 'starting master' });
  });

  it('forks workers', function() {
    master({ numWorkers: 3 });
    expect(cluster.fork.callCount).toEqual(3);
  });

  it('logs its "listening" event', function() {
    spyOn(logfmt, 'log');
    master({ port: 1 });
    cluster.emit('listening');
    expect(logfmt.log).toHaveBeenCalledWith({ evt: 'clusterflock is listening on port 1' });
  });

  it('logs only its first "listening" event', function() {
    master({ port: 1 });
    spyOn(logfmt, 'log');
    cluster.emit('listening');
    cluster.emit('listening');
    expect(logfmt.log.callCount).toEqual(1)
  });

  it('logs its disconnect', function() {
    master({});
    spyOn(logfmt, 'log');
    cluster.emit('disconnect', { process: { pid: 12345 } });
    expect(logfmt.log).toHaveBeenCalledWith({ evt: 'worker (pid 12345) disconnected' });
  });

  it('re-forks a non-suicide worker', function() {
    master({});
    spyOn(logfmt, 'log');
    cluster.emit('disconnect', { suicide: false, process: { pid: 12345 } });
    expect(cluster.fork).toHaveBeenCalled();
  });

  it('does not re-fork a suiciding worker', function() {
    master({});
    spyOn(logfmt, 'log');
    cluster.emit('disconnect', { suicide: true, process: { pid: 12345 } });
    expect(cluster.fork).not.toHaveBeenCalled();
  });

  it('traps and logs SIGINT', function() {
    master({});
    spyOn(logfmt, 'log');
    process.emit('SIGINT');
    expect(logfmt.log).toHaveBeenCalledWith({ evt: 'received SIGINT, sending myself SIGTERM' });
  });

  it('forwards SIGINT to SIGTERM', function() {
    master({});
    process.emit('SIGINT');
    expect(process.kill).toHaveBeenCalledWith(process.pid, 'SIGTERM');
  });

  it('traps and logs SIGTERM', function() {
    master({});
    spyOn(logfmt, 'log');
    process.emit('SIGTERM');
    expect(logfmt.log).toHaveBeenCalledWith({ evt: 'received SIGTERM, sending myself SIGQUIT' })
  });

  it('forwards SIGTERM to SIGQUIT', function() {
    master({});
    process.emit('SIGTERM');
    expect(process.kill).toHaveBeenCalledWith(process.pid, 'SIGQUIT');
  });

  it('traps and logs SIGQUIT', function() {
    master({});
    spyOn(logfmt, 'log');
    process.emit('SIGQUIT');
    expect(logfmt.log).toHaveBeenCalledWith({ evt: 'received SIGQUIT, attempting graceful shutdown' })
  });

  it('disconnects the cluster on SIGQUIT', function() {
    master({});
    spyOn(logfmt, 'log');
    process.emit('SIGQUIT');
    expect(cluster.disconnect).toHaveBeenCalled();
  });

  it('logs the SIGQUIT disconnect', function() {
    cluster.disconnect.andCallFake(function (cb) {
      cb();
    });
    master({});
    spyOn(logfmt, 'log');
    process.emit('SIGQUIT');
    expect(logfmt.log).toHaveBeenCalledWith({ evt: 'all workers disconnected' })
  });

  it('sets a kill timeout on SIGQUIT', function() {
    master({ timeout: 10 });
    spyOn(logfmt, 'log');
    process.emit('SIGQUIT');
    waits(10);
    runs(function() {
      expect(logfmt.log).toHaveBeenCalledWith({ evt: 'timeout exceeded, forcing shutdown' });
    });
  });

  it('kills each worker on SIGQUIT the timeout', function() {
    var killSpy = jasmine.createSpy();
    cluster.workers = { 1: { kill: killSpy } };
    master({ timeout: 10 });
    process.emit('SIGQUIT');
    waits(10);
    runs(function() {
      expect(killSpy).toHaveBeenCalled();
    });
  });
});
