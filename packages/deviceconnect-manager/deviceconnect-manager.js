var express = require('express');
var fs = require('fs');
var pluginMgr = require('./plugin-manager');
var config = require('./config');
var Request = require('./request');
var Response = require('./response');

var app = express();
var packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
var ownProfiles = [];
config.supports.forEach(function(profile) {
    ownProfiles.push(require(profile.module));
});

app.all(['/:api/:profile', '/:api/:profile/:attribute', '/:api/:profile/:interface/:attribute'], function(req, res) {
    var result = false,
        dConnectRequest = new Request(req),
        dConnectResponse = new Response(),
        parsedId, plugin;

    ownProfiles.forEach(function(profile) {
        profile.provides.forEach(function(handler) {
            if (!result && handler.method === dConnectRequest.method
                && handler.api === dConnectRequest.api
                && handler.profile === dConnectRequest.profile
                && handler.interface === dConnectRequest.interface
                && handler.attribute === dConnectRequest.attribute) {
                handler.onRequest(dConnectRequest, dConnectResponse);
                result = true;
            }
        });
    });
    if (result) {
        res.json(dConnectResponse.toJson());
        return;
    }
    parsedId = parseServiceId(req.query.serviceId);
    if (parsedId !== undefined) {
        plugin = pluginMgr.plugin(parsedId.serviceId);
        if (plugin !== undefined) {
            plugin.entryPoint.onRequest(dConnectRequest, dConnectResponse);
        } else {
            // TODO error handling
        }
    } else {
        // TODO error handling
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

module.exports = app;
