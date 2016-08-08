var del = require('del');
var path = require('path');

module.exports = function cleanCoverage() {
    return del(path.resolve(process.cwd(), 'coverage'));
}
