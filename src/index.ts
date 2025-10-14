import borderRadiusWithCurve from './rules/border-radius-with-curve.js';
import preferHairlineWidth from './rules/prefer-hairline-width.js';
import preferBoxShadow from './rules/prefer-box-shadow.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
  rules: {
    'border-radius-with-curve': borderRadiusWithCurve,
    'prefer-hairline-width': preferHairlineWidth,
    'prefer-box-shadow': preferBoxShadow,
  },
  configs: {
    recommended: {
      plugins: ['refined'],
      rules: {
        'refined/border-radius-with-curve': 'warn',
        'refined/prefer-hairline-width': 'warn',
        'refined/prefer-box-shadow': 'warn',
      },
    },
    strict: {
      plugins: ['refined'],
      rules: {
        'refined/border-radius-with-curve': 'error',
        'refined/prefer-hairline-width': 'error',
        'refined/prefer-box-shadow': 'error',
      },
    },
  },
};

export default plugin;
