var http = require('http');
var https = require('https');
var fs = require('fs');
var manager = require('./deviceconnect-manager');
var config = require('./config');

if (config.http.enabled === true) {
    http.createServer(manager).listen(config.http.port);
}
if (config.https.enabled === true) {
    https.createServer({
      cert: fs.readFileSync(config.https.certificate),
      key: fs.readFileSync(config.https.privateKey)
    }, manager).listen(config.https.port);
    
}

if (config.http.enabled === true || config.https.enabled === true) {
    var message = 'Device Connect Manager is running on:\n';
    if (config.http.enabled === true) {
        message += '    - http://localhost:' + config.http.port + '\n'
    }
    if (config.https.enabled === true) {
        message += '    - https://localhost:' + config.https.port + '\n'
    }
    console.log(message);
}
