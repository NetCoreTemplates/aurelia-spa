"use strict";

const VENDOR = [
    'bootstrap/dist/css/bootstrap.css',
    'font-awesome/css/font-awesome.css',
    'aurelia-animator-css',
    'aurelia-event-aggregator',
    'aurelia-framework',
    'aurelia-history-browser',
    'aurelia-logging-console',
    'aurelia-pal-browser',
    'aurelia-polyfills',
    'aurelia-router',
    'aurelia-templating-binding',
    'aurelia-templating-router',
    'aurelia-templating-resources',
    'es6-shim',
    'servicestack-client'
];

const path = require('path'),
      webpack = require('webpack'),
      ExtractTextPlugin = require('extract-text-webpack-plugin'),
      Clean = require('clean-webpack-plugin'),
      AureliaWebPackPlugin = require('aurelia-webpack-plugin');
      
module.exports = (env) => {
    const extractCSS = new ExtractTextPlugin('vendor.dll.css');
    const isDev = !(env && env.prod);
    return [{
        entry: { vendor: VENDOR },
        stats: { modules: false },
        resolve: {
            extensions: [ '.js' ]
        },
        module: {
            rules: [
                { test: /\.(png|woff|woff2|eot|ttf|svg)(\?|$)/, use: 'url-loader?limit=100000' },
                { test: /\.css(\?|$)/, use: extractCSS.extract([ isDev ? 'css-loader' : 'css-loader?minimize' ]) },
                { test: /\.html$/, loader: 'html-loader' }
            ]
        },
        devtool: "source-map",
        output: {
            path: path.join(__dirname, 'wwwroot', 'dist'),
            publicPath: 'dist/',
            filename: '[name].dll.js',
            library: '[name]_[hash]',
        },
        plugins: [
            new Clean([root('wwwroot/dist')]),
            extractCSS,
            new webpack.DllPlugin({
                path: path.join(__dirname, 'wwwroot', 'dist', '[name]-manifest.json'),
                name: '[name]_[hash]'
            }),
            new AureliaWebPackPlugin(),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': isDev ? '"development"' : '"production"'
            })
        ].concat(isDev ? [] : [
            new webpack.optimize.UglifyJsPlugin({ sourceMap: true }),
            new Clean([root('bin/Release/netcoreapp2.0/publish/wwwroot/dist')]),
        ])
    }];

    //helpers
    function root(args) {
        args = Array.prototype.slice.call(arguments, 0);
        return (path || (path = require("path"))).join.apply(path, [__dirname].concat(args));
    }
};

