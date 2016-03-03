module.exports = {

    name: 'servicediscovery',

    apis: [
        {
            method: 'GET',
            profile: 'servicediscovery',
            onRequest: onGetServiceDiscovery
        }
    ]
};

function onGetServiceDiscovery(request, response) {
    var plugin = require('../plugin');

    response.put('services', [{
        id: 'Host',
        name: 'NodeJS Host',
        type: 'WiFi',
        online: true,
        config: '',
        scopes: plugin.scopes()
    }]);
    response.ok();
}
