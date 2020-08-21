module.exports = {
  entry: "src/index",
  reactRefresh: true,
  plugins: [
    {
      resolve: "@poi/plugin-typescript",
    },
    {
      resolve: "@poi/plugin-pwa",
      options: {
        workboxOptions: {
          clientsClaim: true,
          skipWaiting: true,
        },
      },
    },
  ],
  devServer: {
    proxy: "http://localhost:3000",
  },
  configureWebpack: {
    node: {
      fs: "empty",
    },
  },
};
