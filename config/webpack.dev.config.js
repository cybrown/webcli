var mergeWebpackConfig = require('webpack-config-merger');

module.exports = mergeWebpackConfig(require('./webpack.common.config'), {
    devtool: 'source-map'
});
