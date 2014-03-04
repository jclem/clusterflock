var clusterflock = require('../../index');
clusterflock(function(req, res) {
  setTimeout(function() {
    res.end('ok');
  }, 2000);
});
