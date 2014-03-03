# clusterflock

clusterflock is a simple http server clusterer. Pass it a request handler, and
clusterflock will spin up a cluster of servers for you.

## Usage

clusterflock just expects to be passed a single handler function—anything that
can be passed to `http.createServer` ought to work:

```javascript
var clusterflock = require('clusterflock');

clusterflock(function(req, res) {
  res.end('ok');
});
```

```javascript
var clusterflock = require('clusterflock'),
    express      = require('express');

var app = express();
clusterflock(app);
```
