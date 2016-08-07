module.exports = function commandServer(params) {
    var webpack = require('webpack');
    var WebpackDevServer = require('webpack-dev-server');
    var getWebpackConfiguration = require('../util/get-webpack-configuration');
    var defaults = require('../defaults');

    var port = params.port || defaults.port;
    var env = params.env;
    let webpackConfig = getWebpackConfiguration(env);
    var compiler = webpack(webpackConfig);
    var server = new WebpackDevServer(compiler);
    server.listen(port);
};
