# clusterflock

![flocking birds](http://cl.ly/image/0e3E400R1n0U/81938785_7755757d8a_m.jpg)

clusterflock is a simple clustering HTTP server for Node. It accepts a single request handler and a hash of options. The goal of clusterflock is to eliminate my own repeated need for a simple clustering server that implements graceful worker shutdown and re-forking of dead workers.


## Installation

```sh
$ npm install clusterflock --save
```

## Usage

By default, clusterflock will fork the number of workers equal to `os.cpus().length`. When it receives a `SIGINT` or `SIGTERM` signal, it will begin attempting to shut down gracefully by ceasing to receive requests and closing all servers after existing requests have been completed.

The simplest use case of clusterflock is to pass it a single request handler function:

```javascript
var clusterflock = require('clusterflock');

clusterflock(function (req, res) {
  res.end('ok');
});
```

Since clusterflock essentially just calls `http.createServer` in the worker process, anything that can be normally passed to that function can be passed to the `clusterflock` main function, including [express](http://expressjs.com) apps:

```javascript
var clusterflock = require('clusterflock'),
    express      = require('express'),
    app          = express();
    
app.use(express.bodyParser()); // &c.
clusterflock(app);
```

## Options
 
Name         | Type(s)            | Default | Description
------------ | ------------------ | --------------------------   | ------------------
`numWorkers` | `Number`           | `os.cpus().length`           | number of worker processes to fork
`port`       | `Number`, `String` | <code>process.env.PORT &#124;&#124; 5000</code>   | port the workers will listen on
`timeout`    | `Number`           | `1000`                       | amount of time after receiving a graceful shutdown signal that the master will immediately kill workers

## Testing

To run the tests:

```sh
$ npm test
```

## Contributing

1. Fork it.
2. Create a branch (`git checkout -b my-clusterflock`)
3. Commit your changes (`git commit -am "add unicorns"`)
4. Push to the branch (`git push origin my-clusterflock`)
5. Open a [Pull Request](http://github.com/jclem/clusterflock/pulls)

## Meta

The photo in this readme is by Flickr user [Eugene Zemlyanskiy](http://www.flickr.com/photos/pictureperfectpose/81938785/). It has a [CC BY 2.0](http://creativecommons.org/licenses/by/2.0/) license.
