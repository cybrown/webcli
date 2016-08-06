var path = require('path');
var fs = require('fs');
var packageInfo = require('./package.json');
var currentPackageInfo = require(path.resolve(process.cwd(), 'package.json'));

var del = require('del');
var commander = require('commander');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var mergeWebpackConfig = require('webpack-config-merger');
var archiver = require('archiver');
var MemoryFileSystem = require("memory-fs");

var memoryFsUtil = require('./memory-fs-util');

var defaults = require('./defaults');

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

commander
    .version(packageInfo.version);

commander
    .command('server')
    .alias('s')
    .description('Run development server')
    .option('-p, --port <port>', 'Port for development server')
    .action(commandServer);

commander
    .command('build')
    .alias('b')
    .description('Create production files')
    .action(commandBuild);

commander
    .command('package')
    .alias('p')
    .description('Create production package')
    .option('-t --type [type]', 'Create an archive (zip or tgz), defaults to zip', /^(zip|tgz)$/i, 'zip')
    .action(commandPackage);

commander
    .command('clean')
    .description('Remove build files')
    .action(commandClean);

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
    commander.outputHelp();
}

function getWebpackConfiguration(path) {
    var webpackConfiguration = require(path);
    if (typeof readCustomConfiguration().configureWebpack === 'function') {
        webpackConfiguration = readCustomConfiguration().configureWebpack(webpackConfiguration, webpack, mergeWebpackConfig) || webpackConfiguration;
    }
    return webpackConfiguration;
}

function commandServer(env) {
    var port = env.port || defaults.port;
    let webpackConfig = getWebpackConfiguration('./webpack.dev.config');
    var compiler = webpack(webpackConfig);
    var server = new WebpackDevServer(compiler);
    server.listen(port);
}

function commandBuild(env) {
    let webpackConfig = getWebpackConfiguration('./webpack.prod.config');
    webpackConfig.output = {
        path: process.cwd() + '/dist/'
    };
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

function commandPackage(env) {
    let webpackConfig = getWebpackConfiguration('./webpack.prod.config');
    webpackConfig.output.path = '/';
    var fs = new MemoryFileSystem();
    var compiler = webpack(webpackConfig);
    compiler.outputFileSystem = fs;
    compiler.run(function (err, stats) {
        if (err) throw err;
        createArchiveFromMemoryFs(env.type, fs);
    });
}

function commandClean() {
    cleanDist();
}

function createArchiveFromMemoryFs(type, memoryFs) {
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
    memoryFsUtil
        .listFilesRecursive(memoryFs, '/')
        .filter(function (absolutePath) {
            return memoryFs.statSync(absolutePath).isFile();
        })
        .forEach(function (absolutePath) {
            archive.append(memoryFs.readFileSync(absolutePath), { name: absolutePath, stat: memoryFs.statSync(absolutePath) });
        });
    archive.finalize();
    var output = fs.createWriteStream(process.cwd() + '/' + currentPackageInfo.name + '-' + currentPackageInfo.version + '.' + archiveExtension);
    archive.pipe(output);
}

function cleanDist() {
    return del(path.resolve(process.cwd(), 'dist'));
}
