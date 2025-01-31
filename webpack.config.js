var path = require('path');
    var MiniCssExtractPlugin = require('mini-css-extract-plugin');
    var CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
    var ExtractTextPlugin = require('sgmf-scripts')['extract-text-webpack-plugin'];
    var RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
    const CleanWebpackPlugin = require('clean-webpack-plugin');
    var sgmfScripts = require('sgmf-scripts');

    module.exports = [{
        mode: 'production',
        name: 'js',
        entry: sgmfScripts.createJsPath(),
        output: {
            path: path.resolve('./cartridges/pointspay_sfra/cartridge/static'),
            filename: '[name].js'
        },
        plugins: [
            new CleanWebpackPlugin(
                [
                    './cartridges/pointspay_sfra/cartridge/static/default/js',
                ],
                {
                    verbose: true,
                    dry: false,
                    root: path.join(__dirname, ''),
                    beforeEmit: false,
                },
            )
        ]
    },
    {
        mode: 'none',
        name: 'scss',
        entry: sgmfScripts.createScssPath(),
        output: {
            path: path.resolve('./cartridges/pointspay_sfra/cartridge/static'),
            filename: '[name].css'
        },
        module: {
            rules: [{
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [{
                        loader: 'css-loader',
                        options: {
                            url: false,
                            minimize: true
                        }
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('autoprefixer')()
                            ]
                        }
                    }, {
                        loader: 'sass-loader',
                        options: {
                            includePaths: [
                                path.resolve('node_modules'),
                                path.resolve('node_modules/flag-icon-css/sass')
                            ]
                        }
                    }]
                })
            }]
        },
        plugins: [
            new ExtractTextPlugin({ filename: '[name].css' })
        ]
    }];