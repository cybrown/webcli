module.exports = function commandPackage(params) {
    var fs = require('fs');
    var path = require('path');
    var webpack = require('webpack');
    var mergeWebpackConfig = require('webpack-config-merger');
    var archiver = require('archiver');
    var memoryFsUtil = require('../util/memory-fs-util');
    var getWebpackConfiguration = require('../util/get-webpack-configuration');
    var MemoryFileSystem = require('memory-fs');
    var currentPackageInfo = require(path.resolve(process.cwd(), 'package.json'));

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

    var env = params.env;
    var webpackConfig = mergeWebpackConfig(getWebpackConfiguration(env), {
        output: {
            path: '/'
        }
    });
    var memoryFs = new MemoryFileSystem();
    var compiler = webpack(webpackConfig);
    compiler.outputFileSystem = memoryFs;
    compiler.run(function (err, stats) {
        if (err) throw err;
        createArchiveFromMemoryFs(params.type, memoryFs);
    });
};
