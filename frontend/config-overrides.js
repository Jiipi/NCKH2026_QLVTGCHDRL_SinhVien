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

  // Fix framer-motion v12 ESM issue with ES5 target:
  // 1. Alias framer-motion to its CJS build (which already exists at dist/cjs/)
  // 2. Remove ModuleScopePlugin so webpack allows resolving to node_modules paths
  const path = require('path');
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'framer-motion': path.join(__dirname, 'node_modules', 'framer-motion', 'dist', 'cjs', 'index.js'),
  };
  // Remove CRA's ModuleScopePlugin which blocks imports from node_modules
  if (config.resolve.plugins) {
    config.resolve.plugins = config.resolve.plugins.filter(
      plugin => !plugin.constructor || plugin.constructor.name !== 'ModuleScopePlugin'
    );
  }
  
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
