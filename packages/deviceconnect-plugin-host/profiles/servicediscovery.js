var fs = require('fs');

var pluginJson = JSON.parse(fs.readFileSync(__dirname + '/../deviceplugin.json', 'utf8'));
var scopes = (function() {
    var array = [];
    for (var key in pluginJson.deviceplugin_provider) {
        array.push(String(pluginJson.deviceplugin_provider[key].profile));
    }
    return array;
})(pluginJson);

module.exports = {

    name: 'servicediscovery',

    provides: [
        {
            method: 'GET',
            profile: 'servicediscovery',
            onRequest: function(request, response) {
                response.put('services', [{
                    id: 'Host',
                    name: 'NodeJS Host',
                    type: 'WiFi',
                    online: true,
                    config: '',
                    scopes: scopes
                }]);
                response.ok();
            }
        }
    ]
};
