var expect = require('chai').expect;
var request = require('request');
var spawn = require('child_process').spawn;
var Promise = require('es6-promise-polyfill').Promise;
var path = require('path');

function assertResource(path) {
    return new Promise(function (resolve, reject) {
        request('http://localhost:3000' + path, function (err, response, body) {
            expect(err).to.be.null;
            expect(response.statusCode).to.equal(200);
            resolve(body);
        });
    });
}

function assertIndexHtmlBody(body) {
    expect(body).match(/^<!DOCTYPE html>/);
    expect(body).match(/<link href="style\.[a-f0-9]{20}\.css" rel="stylesheet">/);
    expect(body).match(/<script type="text\/javascript" src="bundle\.[a-f0-9]{20}\.js"><\/script>/);
}

function assertBundleJsBody(body) {
    expect(body).match(/console\.log\('ok'\)/);
    expect(body).match(/\/\/# sourceMappingURL=bundle\.[a-f0-9]{20}\.js\.map/);
}

function assertStyleCssBody(body) {
    expect(body).match(/body h1/);
    expect(body).match(/background-color: red;/);
    expect(body).match(/\/\*# sourceMappingURL=style\.[a-f0-9]{20}\.css\.map\*\//);
}

var childWebpackServerProcess = null;

function startWebpackServer(projectName) {
    var packageJson = require(path.resolve(process.cwd(), 'package.json'));
    var originalCwd = process.cwd();
    var binPath = path.resolve(originalCwd, packageJson.bin);
    return function () {
        return new Promise(function (resolve, reject) {
            if (childWebpackServerProcess) {
                throw new Error('Webpack process is already running');
            }
            process.chdir('test-samples/' + projectName);
            childWebpackServerProcess = spawn('node', [binPath, 'server']);
            childWebpackServerProcess.stdout.on('data', function (data) {
                if (/webpack: bundle is now VALID\./.test(data.toString('utf-8'))) {
                    resolve();
                }
            });
        });
    }
}

function stopWebpackServer() {
    return new Promise(function (resolve, reject) {
        if (childWebpackServerProcess) {
            childWebpackServerProcess.kill();
            childWebpackServerProcess.on('close', resolve);
            childWebpackServerProcess.on('error', reject);
        }
    });
}

module.exports = {
    assertResource: assertResource,
    assertIndexHtmlBody: assertIndexHtmlBody,
    assertBundleJsBody: assertBundleJsBody,
    assertStyleCssBody: assertStyleCssBody,
    startWebpackServer: startWebpackServer,
    stopWebpackServer: stopWebpackServer
};
