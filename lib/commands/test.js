module.exports = function commandTest(params) {
    var path = require('path');
    var karma = require('karma');
    var getWebpackConfiguration = require('../util/get-webpack-configuration');

    var Server = karma.Server;
    var karmaOptions = null;
    require(path.resolve(__dirname, '../../config/karma.conf.js'))({
        set: function (opts) {
            karmaOptions = opts;
        }
    });
    karmaOptions.webpack = getWebpackConfiguration('test');
    delete karmaOptions.webpack.entry;
    var server = new Server(karmaOptions, function (exitCode) {
        console.log('Karma has exited with ' + exitCode);
        process.exit(exitCode);
    });
    server.start();
};
