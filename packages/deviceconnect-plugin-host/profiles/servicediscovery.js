var plugin = require('../plugin');

module.exports = {

    name: 'servicediscovery',

    provides: [
        {
            method: 'GET',
            api: 'gotapi',
            profile: 'servicediscovery',
            onRequest: function(request, response) {
                console.log('plugin: ', plugin);

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
        }
    ]
};
