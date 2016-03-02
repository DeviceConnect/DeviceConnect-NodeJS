var express = require('express');
var fs = require('fs');
var pluginMgr = require('./plugin-manager');
var config = require('./config');

var app = express();
var packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var ownProfiles = [];
config.supports.forEach(function(profile) {
    ownProfiles.push(require(profile.module));
});

app.all(['/:api/:profile', '/:api/:profile/:attribute', '/:api/:profile/:interface/:attribute'], function(req, res) {
    var result = false;
    var dConnectResponse = new Response();

    console.log('Request: ' + req.method + ', ' + req.params.api + ', ' + req.params.profile + ', ' +  req.params.interface + ', ' + req.params.attribute);

    ownProfiles.forEach(function(profile) {
        profile.provides.forEach(function(handler) {
            console.log('API: ' + handler.method + ', ' + handler.api + ', ' + handler.profile + ', ' +  handler.interface + ', ' + handler.attribute);

            if (!result && handler.method === req.method
                && handler.api === req.params.api
                && handler.profile === req.params.profile
                && handler.interface === req.params.interface
                && handler.attribute === req.params.attribute) {
                handler.onRequest(req, dConnectResponse);
                result = true;
            }
        });
    });
    if (result) {
        res.json(dConnectResponse.toJson());
        return;
    }

    res.json(dConnectResponse.toJson());
});
app.all('/\*', function(req, res) {
    var json = {
      result: 1
    };
    res.json(json);
});

function parseServiceId(serviceId) {
    const delimiter = '.';
    var index = serviceId.indexOf(delimiter);
    if (index < 0) {
        return undefined;
    }
    return {
      serviceId: serviceId.slice(0, index),
      pluginId: serviceId.slice(index + delimiter.length)
    };
}

var Response = function() {
    this.json = {
        result: 1,
        errorCode: 0,
        errorMessage: ''
    };
};
Response.prototype.put = function(key, value) {
    this.json[key] = value;
};
Response.prototype.ok = function() {
    this.put('result', 0);
};
Response.prototype.error = function(code, message) {
    this.put('result', 1);
    this.put('errorCode', code);
    this.put('errorMessage', message);
};
Response.prototype.toJson = function() {
    this.put('product', packageJson.name);
    this.put('version', packageJson.version);
    return this.json;
};

module.exports = app;
