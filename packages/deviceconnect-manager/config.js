var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

config.http = createServerConfig(config.http);
if (config.http.port === undefined) {
    config.http.port = 4035;
}
config.https = createServerConfig(config.https);
if (config.https.port === undefined) {
    config.https.port = 4036;
}

module.exports = config;

function createServerConfig(server) {
    if (server === undefined) {
        server = {};
    }
    if (server.enabled === undefined) {
        server.enabled = true;
    }
    return server;
}
