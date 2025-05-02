const path = require("path");
const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [require("@tailwindcss/postcss"), require("autoprefixer")],
              },
            },
          },
        ],
      },
    ],
  },
  devServer: {
    static: path.resolve(__dirname, "dist"),
    port: 9000,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
  },
});
