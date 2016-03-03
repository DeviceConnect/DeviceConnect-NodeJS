var plugin = require('../plugin');

module.exports = {

    name: 'serviceinformation',

    provides: [
        {
            method: 'GET',
            api: 'gotapi',
            profile: 'serviceinformation',
            onRequest: function(request, response) {
                if (request.serviceId !== 'Host') {
                    response.error(6);
                    return;
                }
                response.put('supports', plugin.scopes());
                response.ok();
            }
        }
    ]
};