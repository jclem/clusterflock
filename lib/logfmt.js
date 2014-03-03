module.exports = (function() {
  var type;

  if (require('cluster').isMaster) {
    type = 'master';
  } else {
    type = 'worker';
  }

  return require('logfmt').namespace({
    ns  : 'clusterflock',
    pid : process.pid,
    type: type
  });
}());
