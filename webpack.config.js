var fs = require('fs');
var path = require('path');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var webpackHtmlOptions = {};

if (fs.existsSync(process.cwd() + '/index.html')) {
    webpackHtmlOptions.template = process.cwd() + '/index.html';
}

module.exports = {
    name: 'client',
    devtool: 'source-map',
    entry: process.cwd() + '/main.js',
    output: {
        path: process.cwd() + '/dist/',
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.ts', '.tsx']
    },
    module: {
        loaders: [
            { test: /\.html$/, loader: 'html' },
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel', query: { presets: [require.resolve('babel-preset-es2015')] } },
            { test: /\.jsx$/, exclude: /node_modules/, loader: 'babel', query: { presets: [require.resolve('babel-preset-react'), require.resolve('babel-preset-es2015')] } },
            { test: /\.tsx?$/, loader: 'ts' },
            { test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css') },
            { test: /\.less$/, loader: ExtractTextPlugin.extract('style', 'css!less') },
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' }
        ]
    },
    plugins: [
        new ExtractTextPlugin('style.css', {
            allChunks: true
        }),
        new HtmlWebpackPlugin(webpackHtmlOptions)
    ],
    resolveLoader: {
        root: [path.resolve(__dirname, 'node_modules')]
    }
};
