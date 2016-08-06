var path = require('path');
var packageInfo = require('./package.json');

var del = require('del');
var commander = require('commander');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var defaults = require('./defaults');

commander
    .version(packageInfo.version);

commander
    .command('server')
    .description('Run development server')
    .option('-p, --port <port>', 'Port for development server')
    .action(commandRun);

commander
    .command('build')
    .description('Create production files')
    .action(commandDist);

commander
    .command('clean')
    .description('Remove build files')
    .action(commandClean);

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
    commander.outputHelp();
}

function commandRun(env) {
    var port = env.port || defaults.port;
    let webpackConfig = require('./webpack.dev.config');
    var compiler = webpack(webpackConfig);
    var server = new WebpackDevServer(compiler);
    server.listen(port);
}

function commandDist() {
    let webpackConfig = require('./webpack.dist.config');
    var compiler = webpack(webpackConfig);
    cleanDist().then(function () {
        compiler.run(function (err, stats) {
            if (err) throw err;
        });
    }).catch(function (err) {
        console.error('Error');
        console.error(err);
    });
}

function commandClean() {
    cleanDist();
}

function cleanDist() {
    return del(path.resolve(process.cwd(), 'dist'));
}
