const Webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const extractLess = new ExtractTextPlugin({
    filename: '[name].css'
})

let config = {
    entry: {
        shell:  ['babel-polyfill', './shell.js'],
        new:  './src/components/New.jsx'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].chunk.js',
        chunkFilename: '[name]-chunk.js'
    },
    devtool: 'eval-source-map',
    watchOptions: {
        poll: true
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    module: {
        rules: [
            { 
                test: /\.jsx?$/, 
                loader: 'babel-loader', 
                exclude: /node_modules/ 
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    use: ['css-loader', 'less-loader'],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [ 'css-loader' ] 
                })
            },
            {
                test: /\.(png|jpg|gif|woff|svg|eot|ttf|woff2)$/,
                use: [{
                    loader: 'url-loader',
                    options: { limit: 10000 } // Convert images < 10k to base64 strings
                }]
            },
            { 
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, 
                loader: "file-loader"
            }
        ]
    },
    plugins: [
        new Webpack.optimize.CommonsChunkPlugin({
            names: 'vendor',
            filename: 'vendor.js',
            minChunks: ({ resource }) => /node_modules/.test(resource)
        }),
        extractLess,
        new HtmlWebpackPlugin({
            filename: 'index.html',
            chunks: ['vendor', 'shell', 'new'],
            template: './index.html'
        }),
        new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
            threshold: 10240,
            minRatio: 0.8
        }),
        new BundleAnalyzerPlugin({analyzerMode: 'static', openAnalyzer: false})
    ]
}

module.exports = config
