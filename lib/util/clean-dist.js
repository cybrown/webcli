var del = require('del');
var path = require('path');

module.exports = function cleanDist() {
    return del(path.resolve(process.cwd(), 'dist'));
}
