module.exports = function override(config) {
  config.ignoreWarnings = [
    {
      module: /node_modules\/html5-qrcode\//,
    },
  ];
  return config;
};
