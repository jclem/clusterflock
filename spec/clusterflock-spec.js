require('./spec-helper');

var proxyquire = require('proxyquire'),
    cluster    = require('cluster');

describe('clusterflock', function() {
  var clusterflock, 
      handler,
      master,
      options,
      os,
      worker;

  beforeEach(function() {
    handler = function(){};
    options = {};

    master = jasmine.createSpy();
    worker = jasmine.createSpy();
    os     = {};

    clusterflock = proxyquire('../index', {
      './lib/master': master,
      './lib/worker': worker,
      'os'          : os
    });
  });

  it('accepts a numWorkers option', function() {
    options.numWorkers = 1000;
    clusterflock(handler, options);
    expect(options.numWorkers).toEqual(1000);
  });

  it('sets a default number of workers to the number of cpus', function() {
    var cpus = Array(Math.floor(Math.random() * 100));
    spyOn(os, 'cpus').andReturn(cpus);
    clusterflock(handler, options);
    expect(os.cpus).toHaveBeenCalled();
    expect(options.numWorkers).toEqual(cpus.length);
  });

  it('accepts a port option', function() {
    options.port = 12345;
    clusterflock(handler, options);
    expect(options.port).toEqual(12345);
  });

  it('sets the port to the environment variable', function() {
    process.env.PORT = '5001';
    clusterflock(handler, options);
    expect(options.port).toEqual('5001');
    delete process.env.PORT
  });

  it('sets the port to 5000 when there is not env variable', function() {
    clusterflock(handler, options);
    expect(options.port).toEqual(5000);
  });

  it('accepts a timeout option', function() {
    options.timeout = 500;
    clusterflock(handler, options);
    expect(options.timeout).toEqual(500);
  });

  it('sets the default timeout to 1000', function() {
    clusterflock(handler, options);
    expect(options.timeout).toEqual(1000);
  });

  it('calls master in the master process', function() {
    cluster.isMaster = true;
    clusterflock(handler, options);
    expect(master).toHaveBeenCalledWith(options);
  });

  it('calls the worker in non-master processes', function() {
    cluster.isMaster = false;
    clusterflock(handler, options);
    expect(worker).toHaveBeenCalledWith(handler, options);
  });
});
