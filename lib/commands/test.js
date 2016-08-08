module.exports = function commandTest(params) {
    var path = require('path');
    var karma = require('karma');
    var getWebpackConfiguration = require('../util/get-webpack-configuration');

    var withCoverage = params.coverage;
    var karmaConfig = 'test';
    var webpackConfig = 'test';
    if (withCoverage) {
        karmaConfig = 'test-coverage';
        webpackConfig = 'test-coverage';
    }
    var Server = karma.Server;
    var karmaOptions = null;
    require(path.resolve(__dirname, '../../config/karma.' + karmaConfig + '.conf.js'))({
        set: function (opts) {
            karmaOptions = opts;
        }
    });
    karmaOptions.webpack = getWebpackConfiguration(webpackConfig);
    if (params.testReport) {
        karmaOptions.reporters.push('junit');
        karmaOptions.junitReporter = {
            outputDir: 'test-reports',
            outputFile: 'test-results.xml'
        };
    }
    delete karmaOptions.webpack.entry;
    var server = new Server(karmaOptions, function (exitCode) {
        console.log('Karma has exited with ' + exitCode);
        process.exit(exitCode);
    });
    server.start();
};
