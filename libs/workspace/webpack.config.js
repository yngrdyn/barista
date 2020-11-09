const { join } = require('path');
const TerserPlugin = require('terser-webpack-plugin');

// ENTRY bundles
const entries = [
  'src/scripts/affected-args.ts',
  'src/scripts/run-parallel.ts',
  'src/builders/barista-build/builder.ts',
  'src/builders/barista-build/renderer.ts',
  'src/builders/typescript/index.ts',
  'src/builders/packager/index.ts',
  'src/builders/design-tokens/build/index.ts',
  'src/builders/design-tokens/package/index.ts',
  'src/builders/design-tokens/dependency-tree/index.ts',
  'src/builders/design-tokens/tailwindcss/index.ts',
  'src/builders/elements/package-all-elements/index.ts',
  'src/builders/elements/package/index.ts',
  'src/builders/affected-e2e/index.ts',
  'src/schematics/dt-component-e2e/index.ts',
  'src/schematics/dt-component-dev/index.ts',
  'src/index.ts',
  'src/schematics/dt-component-example/index.ts',
];

module.exports = (config) => {
  // enable dynamic chunks
  config.output.filename = '[name].js';
  // reset entries
  config.entry = {};

  for (const entry of entries) {
    const name = entry.replace(/\..+$/, '');
    config.entry[name] = [join(__dirname, entry)];
  }

  // Add tree shaking with terser
  config.optimization = {
    usedExports: true,
    minimizer: [new TerserPlugin()],
  };

  return config;
};
