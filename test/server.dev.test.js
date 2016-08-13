var assertResource = require('./helpers').assertResource;
var assertIndexHtmlBody = require('./helpers').assertIndexHtmlBody;
var assertBundleJsBody = require('./helpers').assertBundleJsBody;
var assertStyleCssBody = require('./helpers').assertStyleCssBody;
var startServer = require('./helpers').startServer;
var stopServer = require('./helpers').stopServer;


describe ('server with dev files', function () {

    var originalCwd = process.cwd();

    beforeEach(function () {
        process.chdir(originalCwd);
    });

    describe ('tests on project1', function () {

        before(startServer('project1'));

        after(stopServer);

        var hash = null;

        it ('should serve index.html', function () {
            return assertResource('/')
                .then(function (body) {
                    hash = body.match(/bundle\.([a-f0-9]{20})\.js/)[1];
                    return body;
                })
                .then(assertIndexHtmlBody);
        });

        it ('should serve bundle.js', function () {
            return assertResource('/bundle.' + hash + '.js')
                .then(assertBundleJsBody);
        });

        it ('should serve style.css', function () {
            return assertResource('/style.' + hash + '.css')
                .then(assertStyleCssBody);
        });

        it ('should serve bundle.js.map', function () {
            return assertResource('/bundle.' + hash + '.js.map');
        });

        it ('should serve style.css.map', function () {
            return assertResource('/style.' + hash + '.css.map');
        });
    });
});
