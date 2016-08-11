var assertResource = require('./helpers').assertResource;
var assertIndexHtmlBody = require('./helpers').assertIndexHtmlBody;
var assertBundleJsBody = require('./helpers').assertBundleJsBody;
var assertStyleCssBody = require('./helpers').assertStyleCssBody;
var startWebpackServer = require('./helpers').startWebpackServer;
var stopWebpackServer = require('./helpers').stopWebpackServer;


describe ('server', function () {

    var originalCwd = process.cwd();

    beforeEach(function () {
        process.chdir(originalCwd);
    });

    describe ('tests on project1', function () {


        before(startWebpackServer('project1'));

        after(stopWebpackServer);

        it ('should serve index.html', function () {
            return assertResource('/')
                .then(assertIndexHtmlBody);
        });

        it ('should serve bundle.js', function () {
            return assertResource('/bundle.641e2d63cf1935eb4a72.js')
                .then(assertBundleJsBody);
        });

        it ('should serve style.css', function () {
            return assertResource('/style.641e2d63cf1935eb4a72.css')
                .then(assertStyleCssBody);
        });

        it ('should serve bundle.js.map', function () {
            return assertResource('/bundle.641e2d63cf1935eb4a72.js.map');
        });

        it ('should serve style.css.map', function () {
            return assertResource('/style.641e2d63cf1935eb4a72.css.map');
        });
    });
});
