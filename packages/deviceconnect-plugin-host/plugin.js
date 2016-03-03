var fs = require('fs');

var profileModules = {};

module.exports = {

    init: function() {
        var json = JSON.parse(fs.readFileSync(__dirname + '/deviceplugin.json', 'utf8'));
        json.deviceplugin_provider.forEach(function(obj) {
            try {
                profileModules[obj.profile] = require(__dirname + '/profiles/' + obj.profile);
            } catch (e) {
                console.error(e);
            }
        });
    },

    scopes: function() {
        var scopes = [];
        for (var key in profileModules) {
            scopes.push(key);
        }
        return scopes;
    },

    onRequest: function(req, res) {
        var module = profileModules[req.profile],
            handlers;
        if (module === undefined) {
            res.error(2);
            return;
        }
        handlers = module.provides.filter(function(obj) {
            return obj.method === req.method;
        });
        if (handlers.length <= 0) {
            res.error(3);
            return;
        }
        handlers = handlers.filter(function(obj) {
            return obj.interface == req.interface && obj.attribute === req.attribute;
        });
        if (handlers.length <= 0) {
            res.error(4);
            return;
        }
        if (handlers.length > 1) {
            res.error(17, 'API implementation is duplicated.');
            return;
        }
        handlers[0].onRequest(req, res);
    }

};