const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const devServer = {
    port: 8000,
    open: true,
    disableHostCheck: true,
    historyApiFallback: true,
    overlay: true,
    stats: "minimal",
    inline: true,
    compress: true,
    contentBase: "/"
};

module.exports = {
    entry: {
        polyfill: "@babel/polyfill",
        bundle: "./src/index.js"
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].[hash].js"
    },
    devtool: 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            }
        ]
    },
    resolve: {
        alias: {
            api: path.resolve(__dirname, "api")
        }
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html"
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                default: false,
                common: {
                    chunks: "all",
                    name: "vendor",
                    test: /[\\/]node_modules[\\/]/
                }
            }
        }
    },
    devServer
};