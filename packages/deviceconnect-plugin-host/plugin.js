var fs = require('fs');

var profiles = {};

module.exports = {

    init: function() {
        var json = JSON.parse(fs.readFileSync(__dirname + '/deviceplugin.json', 'utf8'));
        json.deviceplugin_provider.forEach(function(obj) {
            try {
                profiles[obj.profile] = require(__dirname + '/profiles/' + obj.profile);
            } catch (e) {
                console.error(e);
            }
        });
    },

    scopes: function() {
        var scopes = [];
        for (var key in profiles) {
            scopes.push(key);
        }
        return scopes;
    },

    onRequest: function(req, res) {
        var profile = profiles[req.profile],
            apis;
        if (profile === undefined) {
            res.error(2);
            return;
        }
        apis = profile.apis.filter(function(obj) {
            return obj.method === req.method;
        });
        if (apis.length <= 0) {
            res.error(3);
            return;
        }
        apis = apis.filter(function(obj) {
            return obj.interface == req.interface && obj.attribute === req.attribute;
        });
        if (apis.length <= 0) {
            res.error(4);
            return;
        }
        if (apis.length > 1) {
            res.error(17, 'API implementation is duplicated.');
            return;
        }
        return apis[0].onRequest(req, res);
    },

    onDestroy: function() {
        var callback;
        for (var profileName in profiles) {
            callback = profiles[profileName].onDestroy;
            if (callback !== undefined) {
                callback();
            }
        }
    }

};
