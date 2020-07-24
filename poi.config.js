module.exports = {
  entry: "src/index",
  plugins: [
    {
      resolve: "@poi/plugin-typescript",
    },
    {
      resolve: "@poi/plugin-pwa",
      options: {},
    },
  ],
  devServer: {
    proxy: "http://localhost:3000",
  },
};
