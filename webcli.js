var path = require('path');
var fs = require('fs');
var packageInfo = require('./package.json');
var currentPackageInfo = require(path.resolve(process.cwd(), 'package.json'));

var del = require('del');
var commander = require('commander');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var archiver = require('archiver');

var defaults = require('./defaults');

commander
    .version(packageInfo.version);

commander
    .command('server')
    .alias('s')
    .description('Run development server')
    .option('-p, --port <port>', 'Port for development server')
    .action(commandRun);

commander
    .command('build')
    .alias('b')
    .option('-a --archive [type]', 'Create an archive (zip or tgz)', /^(zip|tgz)$/i, 'zip')
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

function commandDist(env) {
    let webpackConfig = require('./webpack.dist.config');
    var compiler = webpack(webpackConfig);
    cleanDist().then(function () {
        compiler.run(function (err, stats) {
            if (err) throw err;
            if (env.archive) {
                createArchive(env.archive);
            }
        });
    }).catch(function (err) {
        console.error('Error');
        console.error(err);
    });
}

function commandClean() {
    cleanDist();
}

function createArchive(type) {
    var archiverOptions = {};
    var archiveType = 'zip';
    var archiveExtension = 'zip';
    if (type === 'tgz') {
        archiveType = 'tar';
        archiveExtension = 'tar.gz';
        archiverOptions.gzip = true;
        archiverOptions.gzipOptions = { level: 1 };
    } else {
        archiveType = 'zip';
    }
    var archive = archiver.create(archiveType, archiverOptions);
    archive.directory('./dist', '/');
    archive.finalize();
    var output = fs.createWriteStream(process.cwd() + '/' + currentPackageInfo.name + '-' + currentPackageInfo.version + '.' + archiveExtension);
    archive.pipe(output);
}

function cleanDist() {
    return del(path.resolve(process.cwd(), 'dist'));
}
