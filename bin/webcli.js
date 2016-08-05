#!/usr/bin/env node

var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = require('../webpack.config');

var compiler = webpack(webpackConfig);
var server = new WebpackDevServer(compiler);
server.listen(3000);
