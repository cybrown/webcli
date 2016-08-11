var assertResource = require('./helpers').assertResource;
var assertIndexHtmlBody = require('./helpers').assertIndexHtmlBody;
var assertBundleJsBodyMinified = require('./helpers').assertBundleJsBodyMinified;
var assertStyleCssBodyMinified = require('./helpers').assertStyleCssBodyMinified;
var startWebpackServer = require('./helpers').startWebpackServer;
var stopWebpackServer = require('./helpers').stopWebpackServer;


describe ('server with production files', function () {

    var originalCwd = process.cwd();

    beforeEach(function () {
        process.chdir(originalCwd);
    });

    describe ('tests on project1', function () {

        before(startWebpackServer('project1', ['-e', 'prod']));

        after(stopWebpackServer);

        it ('should serve index.html', function () {
            return assertResource('/')
                .then(assertIndexHtmlBody);
        });

        it ('should serve bundle.js', function () {
            return assertResource('/bundle.927e97611670028e21f2.js')
                .then(assertBundleJsBodyMinified);
        });

        it ('should serve style.css', function () {
            return assertResource('/style.927e97611670028e21f2.css')
                .then(assertStyleCssBodyMinified);
        });

        it ('should not serve bundle.js.map', function () {
            return assertResource('/bundle.927e97611670028e21f2.js.map', 404);
        });

        it ('should not serve style.css.map', function () {
            return assertResource('/style.927e97611670028e21f2.css.map', 404);
        });
    });
});
