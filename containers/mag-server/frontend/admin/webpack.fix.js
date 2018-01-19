const Webpack = require('webpack')
const path = require('path')


let config = {
    module: {
        rules: [
            { 
                test: /\.jsx?$/, 
                loader: 'babel-loader', 
                exclude: /node_modules(?!\/quill-image-drop-module|quill-image-resize-module)/
            }
        ]
    },
    plugins: [
        new Webpack.ProvidePlugin({
            'window.Quill': 'quill'
        })
    ]
}

module.exports = config
