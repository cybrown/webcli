var del = require('del');
var path = require('path');

module.exports = function cleanCoverage() {
    return del([
        path.resolve(process.cwd(), 'coverage'),
        path.resolve(process.cwd(), 'dist'),
        path.resolve(process.cwd(), 'test-reports')
    ]);
}
