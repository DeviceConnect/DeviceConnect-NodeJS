var express = require('express');
var multiparty = require('multiparty');
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

// Support Multipart.
app.use(function(req, res, next) {
    if (req.method === 'PUT' || req.method === 'POST') {
        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
            fields = fields || {};
            Object.keys(fields).forEach(function(name) {
                var field = fields[name] || [];
                if (field.length > 0) {
                    req.query[name] = field[0];
                }
            });
            next();
        });
    } else {
        next();
    }
});

// Support CORS.
app.use(function(req, res, next) {
    var allowedMethods = req.get('access-control-request-headers');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'XMLHttpRequest' + (allowedMethods ? ', ' + allowedMethods : ''));
    res.header('Access-Control-Allow-Origin', '*');
    next();
});
app.options('*', function(req, res) {
    res.sendStatus(200);
});

// Support Device Connect APIs.
app.all(['/:api/:profile', '/:api/:profile/:attribute', '/:api/:profile/:interface/:attribute'], function(req, res) {
    var dConnectRequest = new Request(req),
        dConnectResponse = new Response(),
        parsedId, plugin, handler;
    
    if (req.params.api !== 'gotapi') {
        res.status(404).send('404 Not Found');
        return;
    }
    try {
        handler = findOwnHandler(dConnectRequest);
        if (handler !== null) {
            handler.onRequest(dConnectRequest, dConnectResponse);
            return;
        }
        if (req.query === undefined || req.query.serviceId === undefined) {
            dConnectResponse.error(5);
            return;
        }
        parsedId = parseServiceId(req.query.serviceId);
        if (parsedId === null) {
            dConnectResponse.error(6, 'Service ID is invalid.');
            return;
        }
        dConnectRequest.serviceId = parsedId.serviceId;
        plugin = pluginMgr.plugin(parsedId.pluginId);
        if (plugin === undefined) {
            dConnectResponse.error(6, 'Device plug-in is not found.');
            return;
        }
        plugin.entryPoint.onRequest(dConnectRequest, dConnectResponse);
    } catch (e) {
        dConnectResponse.error(1, e.toString());
    } finally {
        dConnectResponse.put('product', packageJson.name);
        dConnectResponse.put('version', packageJson.version);
        res.json(dConnectResponse.toJson());
    }
});
app.all('/\*', function(req, res) {
    res.status(404).send('404 Not Found');
});

function findOwnHandler(request) {
    var i, k, handlers, handler;
    for (i = 0; i < ownProfiles.length; i++) {
        handlers = ownProfiles[i].provides;
        for (k = 0; k < handlers.length; k++) {
            handler = handlers[k];
            if (handler.method === request.method
                && handler.profile === request.profile
                && handler.interface === request.interface
                && handler.attribute === request.attribute) {
                return handler;
            }
        }
    }
    return null;
}

function parseServiceId(serviceId) {
    const delimiter = '.';
    var index = serviceId.indexOf(delimiter);
    if (index < 0) {
        return null;
    }
    return {
      serviceId: serviceId.slice(0, index),
      pluginId: serviceId.slice(index + delimiter.length)
    };
}

module.exports = app;
