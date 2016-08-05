var path = require('path');

var del = require('del');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

let webpackConfig = null;

if (process.argv[2] === 'dist') {
    webpackConfig = require('./webpack.dist.config');
} else {
    webpackConfig = require('./webpack.dev.config');
}

var compiler = webpack(webpackConfig);
if (process.argv[2] === 'dist') {
    del(path.resolve(process.cwd(), 'dist')).then(function () {
        compiler.run(function (err, stats) {
            if (err) throw err;
        });
    }).catch(function (err) {
        console.error('Error');
        console.error(err);
    });
} else {
    var server = new WebpackDevServer(compiler);
    server.listen(3000);
}
