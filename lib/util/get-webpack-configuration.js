var fs = require('fs');
var path = require('path');

module.exports = function getWebpackConfiguration(env) {
    var webpackConfiguration = require('../../config/webpack.' + env + '.config');
    if (typeof readCustomConfiguration().configureWebpack === 'function') {
        webpackConfiguration = readCustomConfiguration().configureWebpack(webpackConfiguration, webpack, mergeWebpackConfig) || webpackConfiguration;
    }
    return webpackConfiguration;
};

var readCustomConfiguration = (function () {
    var customConfigurationCallbacks = null;
    return function () {
        if (!customConfigurationCallbacks) {
            var pathToCustomConfigurationCallbacks = path.resolve(process.cwd(), 'webcli.config.js');
            if (fs.existsSync(pathToCustomConfigurationCallbacks)) {
                customConfigurationCallbacks = require(pathToCustomConfigurationCallbacks);
            }
            customConfigurationCallbacks = {};
        }
        return customConfigurationCallbacks;
    }
})();
