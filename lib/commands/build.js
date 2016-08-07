module.exports = function commandBuild(params) {
    var webpack = require('webpack');
    var mergeWebpackConfig = require('webpack-config-merger');
    var getWebpackConfiguration = require('../util/get-webpack-configuration');
    var cleanDist = require('../util/clean-dist');

    var env = params.env;
    var webpackConfig = mergeWebpackConfig(getWebpackConfiguration(env), {
        output: {
            path: process.cwd() + '/dist/'
        }
    });
    var compiler = webpack(webpackConfig);
    cleanDist().then(function () {
        compiler.run(function (err, stats) {
            if (err) throw err;
        });
    }).catch(function (err) {
        console.error('Error');
        console.error(err);
    });
};
