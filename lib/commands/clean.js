module.exports = function commandClean() {
    var cleanDist = require('../util/clean-dist');
    var cleanCoverage = require('../util/clean-coverage');

    cleanDist();
    cleanCoverage();
};
