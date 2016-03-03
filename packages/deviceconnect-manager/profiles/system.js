var config = require('../config');
var pluginMgr = require('../plugin-manager');

module.exports = {
    provides: [
        {
            method: 'GET',
            profile: 'system',
            onRequest: function(request, response) {
                var supports = [];
                config.supports.forEach(function(profile) {
                    supports.push(profile.name);
                });
                var plugins = [];
                pluginMgr.plugins().forEach(function(plugin) {
                    plugins.push({
                      id: plugin.id,
                      name: getPluginName(plugin.json),
                      version: plugin.version,
                      supports: getSupportedProfileNames(plugin.json)
                    });
                });
                response.put('supports', supports);
                response.put('plugins', plugins);
                response.ok();
            }
        }
    ]
};

function getPluginName(json) {
    var name;
    if (json.deviceplugin_name !== undefined && config.lang !== undefined) {
        name = json.deviceplugin_name[config.lang];
    }
    if (name !== undefined) {
        return name;
    }
    return 'unknown';
}

function getSupportedProfileNames(json) {
    var array = [];
    if (json.deviceplugin_provider !== undefined) {
        json.deviceplugin_provider.forEach(function(obj) {
            if (obj.profile) {
              array.push(obj.profile);
            }
        });
    }
    return array;
}
