const path = require('path')
module.exports = {
    target: 'node',
    mode: 'production',
    optimization: {
        nodeEnv: false
    },
    externals: ['newrelic'],
    entry: './src/entry.js',
    output: {
        path: path.join(__dirname, '../build'),
        filename: 'prodBundle.js',
        libraryTarget: 'commonjs',
    },
    resolve: {
        extensions: ['.js', '.json'],
    },
}