var http = require('http');
var https = require('https');
var fs = require('fs');
var manager = require('./deviceconnect-manager');
var config = require('./config');
var httpPort = config.httpServer.port;
var httpsPort = config.httpsServer.port;
var certificate = config.httpsServer.certificate;
var privateKey = config.httpsServer.privateKey;

http.createServer(manager).listen(httpPort);
https.createServer({
  cert: fs.readFileSync(certificate),
  key: fs.readFileSync(privateKey)
}, manager).listen(httpsPort);

console.log('Device Connect Manager is running on:\n'
  + '    - http://localhost:' + httpPort + '\n'
  + '    - https://localhost:' + httpsPort);
