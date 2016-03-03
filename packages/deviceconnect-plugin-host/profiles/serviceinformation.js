module.exports = {

    name: 'serviceinformation',

    apis: [
        {
            method: 'GET',
            profile: 'serviceinformation',
            onRequest: onGetSystemInformation
        }
    ]
};

function onGetSystemInformation(request, response) {
    var plugin = require('../plugin');
    if (request.serviceId !== 'Host') {
        response.error(6);
        return;
    }
    response.put('supports', plugin.scopes());
    response.ok();
}