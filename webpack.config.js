const path = require("path");

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: "./index.ts",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "fastify"),
  },
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }], "@babel/preset-typescript"],
          },
        },
      },
    ],
  },
};
