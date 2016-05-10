var Request = require('../request');
var Response = require('../response');
var pluginMgr = require('../plugin-manager');

module.exports = {

    provides: [
        {
            method: 'GET',
            profile: 'servicediscovery',
            onRequest: onGetServiceDiscovery
        }
    ]

};

function onGetServiceDiscovery(request, response) {
    var plugins = pluginMgr.plugins(),
        allServices = [];

    plugins.forEach(function(plugin) {
        var services,
            subRequest = request;
            subResponse = new Response();

        plugin.entryPoint.onRequest(subRequest, subResponse);

        if (subResponse.isOk()) {
            services = subResponse.json.services;
            services.forEach(function(service) {
                service.id = service.id + '.' + plugin.id;
                allServices.push(service);
            });
        } else {
            console.error('servicediscovery: code = ' + subResponse.errorCode);
        }
    });
    response.put('services', allServices);
    response.ok();
}
