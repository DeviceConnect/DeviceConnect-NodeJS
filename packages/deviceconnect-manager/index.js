var http = require('http');
var manager = require('./deviceconnect-manager');
var config = require('./config');

http.createServer(manager).listen(config.httpServer.port);
