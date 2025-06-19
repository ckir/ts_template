// webpack.config.browser.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    filename: 'my-package.min.js',
    path: path.resolve(__dirname, 'dist/browser'),
    library: 'MyPackage',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
    // === START OF CHANGES FOR NODE.JS CORE MODULE FALLBACKS ===
    fallback: {
      "path": require.resolve("path-browserify"),
      // Add other Node.js core modules here if you encounter more errors.
      // Example of common fallbacks if needed:
      // "fs": false, // Usually set to false as file system access is not available in browsers
      // "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      // "stream": require.resolve("stream-browserify"),
      // "buffer": require.resolve("buffer/"), // Note the trailing slash for 'buffer'
      // "util": require.resolve("util/"),
      // "assert": require.resolve("assert/"),
      // "url": require.resolve("url/"),
      // "http": require.resolve("stream-http"),
      // "https": require.resolve("https-browserify"),
      // "zlib": require.resolve("browserify-zlib"),
    },
    // === END OF CHANGES ===
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.build.json',
            },
          },
          // Add babel-loader here if you need to transpile for older browsers
          // {
          //   loader: 'babel-loader',
          //   options: {
          //     presets: [['@babel/preset-env', { targets: 'defaults' }]],
          //   },
          // },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  devtool: 'source-map',
  target: 'web',
  externals: [],
};