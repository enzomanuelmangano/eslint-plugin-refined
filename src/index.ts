import borderRadiusWithCurve = require('./rules/border-radius-with-curve');
import preferHairlineWidth = require('./rules/prefer-hairline-width');
import preferBoxShadow = require('./rules/prefer-box-shadow');
import springConfigConsistency = require('./rules/spring-config-consistency');
import avoidTouchableOpacity = require('./rules/avoid-touchable-opacity');
import { readFileSync } from 'fs';
import { join } from 'path';

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
    'spring-config-consistency': springConfigConsistency,
    'avoid-touchable-opacity': avoidTouchableOpacity,
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

export = plugin;
