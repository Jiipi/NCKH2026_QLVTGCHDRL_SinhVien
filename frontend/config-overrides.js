module.exports = function override(config, env) {
  // Set webpack target to support older browsers
  config.target = ['web', 'es5'];
  
  // Completely disable module feature in webpack output
  config.output.environment = {
    arrowFunction: false,
    bigIntLiteral: false,
    const: false,
    destructuring: false,
    dynamicImport: false,
    dynamicImportInWorker: false,
    forOf: false,
    module: false,
    optionalChaining: false,
    templateLiteral: false,
  };
  
  // Ensure module type is not set
  delete config.output.module;
  
  // Don't set libraryTarget - causes library name error
  // Use default configuration for chunk format
  
  // Optimization for older browsers
  if (config.optimization) {
    config.optimization.minimize = true;
    config.optimization.usedExports = false;
  }

  // Disable source maps in production
  if (env === 'production') {
    config.devtool = false;
  }

  return config;
};
