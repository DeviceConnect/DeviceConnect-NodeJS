var fs = require('fs');
var crypto = require('crypto');
var config = require('./config');

var plugins = {};
searchPlugins('../', plugins);

function searchPlugins(rootPath, plugins) {
    var dirNames;
    dirNames = fs.readdirSync(rootPath).filter(function(fileName) {
        return fs.statSync(rootPath + '/' + fileName).isDirectory();
    });
    if (dirNames.length == 0) {
        return;
    }
    dirNames.forEach(function(dirName) {
        const pluginJsonName = 'deviceplugin.json';
        const packageJsonName = 'package.json';
        var info, pluginJson, packageJson;
        var dirPath = rootPath + '/' + dirName;
        var pluginJsons = fs.readdirSync(dirPath).filter(function(fileName) {
            return fileName === pluginJsonName;
        });
        if (pluginJsons.length == 1) {
            pluginJson = JSON.parse(fs.readFileSync(dirPath + '/' + pluginJsonName, 'utf8'));
            packageJson = JSON.parse(fs.readFileSync(dirPath + '/' + packageJsonName, 'utf8'));
            info = {
              id: generatePluginId(dirPath),
              version: packageJson.version,
              json: pluginJson,
              entryPoint: require(dirPath)
            };
            plugins[info.id] = info;
        }
        searchPlugins(dirPath, plugins);
    });
}

function generatePluginId(pluginPath) {
    var md5hash = crypto.createHash('md5');
    md5hash.update(pluginPath, 'utf8');
    return md5hash.digest('hex');
}

module.exports = {
    plugins: function() {
      var array = [];
      for (var p in plugins) {
        array.push(plugins[p]);
      }
      return array;
    },
    plugin: function(pluginId) {
        return plugins[pluginId];
    }
};
