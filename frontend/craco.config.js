module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix dynamic import issue
      webpackConfig.output = {
        ...webpackConfig.output,
        environment: {
          dynamicImport: false,
          module: false,
        },
      };
      return webpackConfig;
    },
  },
};
