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
        var info, pluginJson, packageJson, entryPoint,
            dirPath = rootPath + '/' + dirName,
            pluginJsons = fs.readdirSync(dirPath).filter(function(fileName) {
            return fileName === pluginJsonName;
        });
        if (pluginJsons.length == 1) {
            pluginJson = JSON.parse(fs.readFileSync(dirPath + '/' + pluginJsonName, 'utf8'));
            packageJson = JSON.parse(fs.readFileSync(dirPath + '/' + packageJsonName, 'utf8'));
            entryPoint = require(dirPath);
            if (!checkRequestHandler(dirPath, entryPoint)) {
                return;
            }
            info = {
              id: generatePluginId(dirPath),
              version: packageJson.version,
              json: pluginJson,
              entryPoint: entryPoint
            };
            plugins[info.id] = info;
        }
        searchPlugins(dirPath, plugins);
    });
}

function checkRequestHandler(dirPath, entryPoint) {
    if (entryPoint.onRequest === undefined) {
        console.error('The plug-in entry point does not have "onRequest" function. '
            + 'This plug-in will be ignored: ' + dirPath + '\n');
        return false;
    }
    if (typeof entryPoint.onRequest !== 'function') {
        console.error('"onRequest" property of the plug-in entry point is not function. '
            + 'This plug-in will be ignored: ' + dirPath + '\n');
        return false;
    }
    return true;
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
