var fs = require('fs');
var profileModules = (function() {
    var pluginJson = JSON.parse(fs.readFileSync(__dirname + '/deviceplugin.json', 'utf8'));
    var modules = {};
    pluginJson.deviceplugin_provider.forEach(function(obj) {
        try {
            modules[obj.profile] = require(__dirname + '/profiles/' + obj.profile);
        } catch (e) {
            console.error(e);
        }
    });
    return modules;
})();

module.exports = {

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
