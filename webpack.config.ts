/* eslint-disable @typescript-eslint/no-var-requires */
import * as webpack from 'webpack';
import { CheckerPlugin } from 'awesome-typescript-loader';
// doesn't want to be resolved properly using the es-module syntax
const TerserPlugin = require('terser-webpack-plugin');
const AwsSamPlugin = require('aws-sam-webpack-plugin');

const awsSamPlugin = new AwsSamPlugin({ vscodeDebug: false });

const isProduction = process.env.NODE_ENV === 'production';

const config: webpack.Configuration = {
  mode: isProduction ? 'production' : 'development',
  target: 'node',
  entry: () => awsSamPlugin.entry(),
  output: {
    filename: '[name]/app.js',
    libraryTarget: 'commonjs2',
    path: `${__dirname}/.aws-sam/build/`
  },
  resolve: {
    extensions: [ '.ts', '.js' ]
  },
  externals: isProduction ? [ 'aws-sdk' ] : [],
  plugins: [
    new CheckerPlugin(),
    awsSamPlugin
  ],
  optimization: {
    minimize: isProduction,
    minimizer: [ new TerserPlugin({
      extractComments: false
    }) ]
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'awesome-typescript-loader',
        options: {
          useCache: true,
          cacheDirectory: '.cache',
          configFileName: 'tsconfig-prod.json',
          reportFiles: [
            'src/**/*.ts'
          ]
        }
      }
    ]
  }
};

// eslint-disable-next-line import/no-default-export
export default config;
