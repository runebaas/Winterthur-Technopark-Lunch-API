/* eslint-disable @typescript-eslint/no-var-requires */
import * as webpack from 'webpack';
import { CheckerPlugin } from 'awesome-typescript-loader';
// doesn't want to be resolved properly using the es-module syntax
const TerserPlugin = require('terser-webpack-plugin');
const AwsSamPlugin = require('aws-sam-webpack-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const awsSamPlugin = new AwsSamPlugin({ vscodeDebug: false });

const isProduction = process.env.NODE_ENV === 'production';

const config: webpack.Configuration = {
  mode: isProduction ? 'production' : 'development',
  target: 'node',
  entry: () => awsSamPlugin.entry(),
  output: {
    filename: 'app.js',
    libraryTarget: 'commonjs2',
    path: `${__dirname}/.aws-sam/build/Lambda`
  },
  resolve: {
    extensions: [ '.ts', '.js', '.wasm' ]
  },
  externals: isProduction ? [ 'aws-sdk' ] : [],
  plugins: [
    new CheckerPlugin(),
    new WasmPackPlugin({
      crateDirectory: __dirname,
      extraArgs: '--target bundler'
    }),
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
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/experimental'
      }
    ]
  }
};

// eslint-disable-next-line import/no-default-export
export default config;
