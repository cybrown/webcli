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
    .option('-e --env <environment>', 'Specify environment, dev or prod', /^(dev|prod)$/i, 'dev')
    .action(commandServer);

commander
    .command('build')
    .alias('b')
    .description('Create production files')
    .option('-e --env <environment>', 'Specify environment, dev or prod', /^(dev|prod)$/i, 'prod')
    .action(commandBuild);

commander
    .command('package')
    .alias('p')
    .description('Create production package')
    .option('-t --type [type]', 'Create an archive (zip or tgz), defaults to zip', /^(zip|tgz)$/i, 'zip')
    .option('-e --env <environment>', 'Specify environment, dev or prod', /^(dev|prod)$/i, 'prod')
    .action(commandPackage);

commander
    .command('test')
    .description('Run unit tests')
    .option('-e --env <environment>', 'Specify environment, dev or prod', /^(dev|prod)$/i, 'dev')
    .action(commandTest);

commander
    .command('clean')
    .description('Remove build files')
    .action(commandClean);

commander.parse(process.argv);

if (!process.argv.slice(2).length) {
    commander.outputHelp();
}

function getWebpackConfiguration(env) {
    var webpackConfiguration = require('./webpack.' + env + '.config');
    if (typeof readCustomConfiguration().configureWebpack === 'function') {
        webpackConfiguration = readCustomConfiguration().configureWebpack(webpackConfiguration, webpack, mergeWebpackConfig) || webpackConfiguration;
    }
    return webpackConfiguration;
}

function commandServer(params) {
    var port = params.port || defaults.port;
    var env = params.env;
    let webpackConfig = getWebpackConfiguration(env);
    var compiler = webpack(webpackConfig);
    var server = new WebpackDevServer(compiler);
    server.listen(port);
}

function commandBuild(params) {
    var env = params.env;
    let webpackConfig = mergeWebpackConfig(getWebpackConfiguration(env), {
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
}

function commandPackage(params) {
    var env = params.env;
    let webpackConfig = mergeWebpackConfig(getWebpackConfiguration(env), {
        output: {
            path: '/'
        }
    });
    var fs = new MemoryFileSystem();
    var compiler = webpack(webpackConfig);
    compiler.outputFileSystem = fs;
    compiler.run(function (err, stats) {
        if (err) throw err;
        createArchiveFromMemoryFs(params.type, fs);
    });
}

function commandTest(params) {
    var Server = require('karma').Server;
    var karmaOptions = null;
    require(path.resolve(__dirname, 'karma.conf.js'))({
        set: function (opts) {
            karmaOptions = opts;
        }
    });
    karmaOptions.webpack = getWebpackConfiguration(params.env);
    delete karmaOptions.webpack.entry;
    var server = new Server(karmaOptions, function (exitCode) {
        console.log('Karma has exited with ' + exitCode);
        process.exit(exitCode);
    });
    server.start();
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
