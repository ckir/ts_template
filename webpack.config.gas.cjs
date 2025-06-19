// webpack.config.gas.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // 1. Mode: 'production' for optimized output, 'development' for easier debugging
  mode: 'production',

  // 2. Entry: Your main TypeScript file for the GAS project
  //    This is where Webpack starts building its dependency graph.
  entry: './src/main.ts', // Assuming 'src/main.ts' is your primary entry for GAS

  // 3. Output: Defines where the bundled file goes and how it's named/exposed
  output: {
    // The filename for the bundled output. Apps Script conventionally uses 'Code.gs'.
    filename: 'Code.gs',
    // The output directory for the bundled file.
    // We'll put GAS-specific output in its own subfolder to keep things organized.
    path: path.resolve(__dirname, 'dist/gas'),
    // crucial for Apps Script: Expose functions globally.
    // 'var' makes your entry point's exports available as global variables.
    // 'library' defines the name of the global variable.
    // If you name it 'global', exports will be attached directly to the global object.
    // For simpler setups, having a global object (e.g., 'MyGasLib') and then
    // attaching your exposed functions to it, is a common pattern.
    // However, for direct GAS top-level function calls (like doGet, onOpen),
    // we often want them directly on the global scope.
    // The 'gas-webpack-plugin' handles this more elegantly, but without it,
    // you typically expose a single global object and call functions like `MyLib.doGet()`.
    // Alternatively, you can use a custom 'libraryTarget' or directly assign in your source.
    // For direct top-level functions (e.g., doGet, doPost, onOpen) to work naturally
    // you need to ensure they are at the top level of the output.
    // A common workaround without a specific plugin is to ensure your entry
    // file exports them, and then in a separate GAS file you manually call them,
    // or you use a more advanced output configuration to make them global.
    // For now, let's assume `libraryTarget: 'var'` and a library name, and you'll manually
    // ensure your GAS entry points call functions from this library or are structured to be global.
    // Or, for direct global functions without a wrapper object, you might omit `library`
    // and rely on direct global assignments in your source or a custom output logic.
    // For this example, let's aim for a direct global exposure pattern, which `gas-webpack-plugin`
    // would normally facilitate. Without it, you need careful structuring.
    // A common pattern: ensure your `src/main.ts` explicitly puts functions on `globalThis`
    // or `this` if they need to be top-level GAS functions.
    // E.g., `globalThis.doGet = doGet;`

    // Let's use a pattern that creates a global object if you prefer,
    // or rely on explicit global assignments in your TypeScript source.
    // For direct global function calls (e.g., `doGet()`), you might structure your `src/main.ts`
    // to assign functions directly to `globalThis`.
    // Example: globalThis.myAppsScriptFunction = myAppsScriptFunction;
    // For basic functionality without the plugin, ensuring your functions are
    // accessible in the global scope is key.
    // A simple output that just bundles everything is often sufficient for GAS
    // if your entry file directly assigns the functions to `globalThis`.
    // The default `var` library target makes the bundle's exports available under a global.
    // If your main.ts *only* contains top-level functions for GAS:
    // output: {
    //   filename: 'Code.gs',
    //   path: path.resolve(__dirname, 'dist/gas'),
    //   libraryTarget: 'this', // Makes exported functions properties of `this` (global in GAS context)
    //   library: 'globalThis', // This won't work directly in all cases for truly global.
    //   // Better approach: Rely on explicit global assignments within your `src/main.ts`
    //   // for direct Apps Script entry points (doGet, onOpen etc.).
    //   // Webpack will then bundle everything else.
    // }
  },

  // 4. Resolve: How Webpack resolves module paths (e.g., extensions to look for)
  resolve: {
    // Order matters: TypeScript files first, then JavaScript.
    extensions: ['.ts', '.js'],
    // This is crucial if you're using path aliases in your tsconfig.json's baseUrl.
    // You'd need to add them here using a package like 'tsconfig-paths-webpack-plugin'.
    // alias: {
    //   '@utils': path.resolve(__dirname, 'src/utils/'),
    // },
  },

  // 5. Module: Rules for how different types of modules are treated
  module: {
    rules: [
      {
        test: /\.ts$/, // Apply this rule to .ts files
        use: [
          {
            loader: 'ts-loader', // Use ts-loader to transpile TypeScript to JavaScript
            options: {
              // Point ts-loader to your specific tsconfig for the build process.
              // If you have a `tsconfig.build.json` for Node, you might use it here.
              // Otherwise, your main `tsconfig.json` is fine.
              configFile: 'tsconfig.build.json'
            },
          },
        ],
        exclude: /node_modules/, // Don't process files in node_modules
      },
      // If you have any other file types (e.g., JSON, text) that need to be inlined,
      // you'd add loaders here. For Apps Script, usually just TS/JS.
    ],
  },

  // 6. Optimization: Settings for minimizing output size and optimizing bundles
  optimization: {
    minimize: true, // Enable minification for production mode
    minimizer: [
      new TerserPlugin({
        // Terser is a JavaScript minimizer.
        // It's crucial for reducing the file size of your GAS bundle.
        terserOptions: {
          // Keep specific comments, e.g., JSDoc or license comments, which can be useful
          // for Apps Script documentation or compliance.
          format: {
            comments: /@preserve|@license|@cc_on/i, // Keep important comments
          },
          // Apps Script often uses global functions. Don't mangle top-level names
          // that you intend to be called directly by GAS.
          // This is a delicate balance: minifying is good, but breaking GAS entry points is bad.
          // Setting `keep_fnames` and `keep_classnames` can help, but generally,
          // it's better to ensure your GAS entry points are explicitly assigned to `globalThis`
          // in your TypeScript code, which Webpack/Terser typically won't mangle.
          // For truly robust global exposure without a plugin, you might rely on source code.
          mangle: {
            // Options to prevent mangling of specific names.
            // If you have top-level functions like `doGet`, `onOpen` in your TS,
            // they *must not* be mangled. If they are global assignments (e.g., `globalThis.doGet = ...`),
            // Terser is less likely to mangle the property name itself.
            reserved: ['doGet', 'doPost', 'onOpen', 'onEdit', 'onInstall', 'onSelectionChange', 'main'], // Add any other global GAS functions you use
            // If you're building a library that exposes a global variable, add it here too.
            // Example: `MyLib` if `output.library` was set to `MyLib`
          },
        },
        extractComments: false, // Don't extract comments into separate files (keep everything in one .gs file)
      }),
    ],
    // For a single Apps Script file, you usually don't need code splitting.
    // splitChunks: false,
    // runtimeChunk: false,
  },

  // 7. Devtool: Controls how source maps are generated (for debugging)
  //    'source-map' is good for development. For production GAS, you might omit or use 'none'
  //    to prevent shipping source map comments, though the minified output is often enough.
  devtool: 'inline-source-map', // or 'source-map' or 'none' for final production
  // 'inline-source-map' is useful as it embeds the source map directly in the `.gs` file,
  // which can simplify debugging in the Apps Script editor (though editor support for them varies).

  // 8. Target: Important for Apps Script!
  //    This tells Webpack the environment your code will run in.
  //    'web' is a good default for browser-like environments.
  //    Apps Script is not Node.js, so 'node' is incorrect.
  target: 'web',

  // 9. Externals: List modules that should NOT be bundled.
  //    For Apps Script, you usually want *everything* bundled, as there's no `node_modules`.
  //    If you had any Node.js specific built-ins (like `fs`, `path`) that somehow
  //    crept into your shared code and you want to ensure they are excluded from the GAS bundle
  //    (because GAS doesn't have them), you'd list them here.
  //    For a clean Apps Script build, it's better to avoid Node.js-specific dependencies in shared code.
  externals: [], // Usually empty for GAS
};
