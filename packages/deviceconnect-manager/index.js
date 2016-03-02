var http = require('http');
var manager = require('./deviceconnect-manager');
var config = require('./config');
var httpPort = config.httpServer.port;

http.createServer(manager).listen(httpPort);

console.log('Device Connect Manager is running on:\n    - http://localhost:' + httpPort);
