import borderRadiusWithCurve = require('./rules/border-radius-with-curve');
import preferHairlineWidth = require('./rules/prefer-hairline-width');
import preferBoxShadow = require('./rules/prefer-box-shadow');
import springConfigConsistency = require('./rules/spring-config-consistency');
import avoidTouchableOpacity = require('./rules/avoid-touchable-opacity');
import requireHitslopSmallTouchables = require('./rules/require-hitslop-small-touchables');
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
    'require-hitslop-small-touchables': requireHitslopSmallTouchables,
  },
  configs: {
    recommended: {
      plugins: ['refined'],
      rules: {
        'refined/border-radius-with-curve': 'warn',
        'refined/prefer-hairline-width': 'warn',
        'refined/prefer-box-shadow': 'warn',
        'refined/require-hitslop-small-touchables': 'warn',
        'refined/spring-config-consistency': 'warn',
        'refined/avoid-touchable-opacity': 'warn',
      },
    },
    strict: {
      plugins: ['refined'],
      rules: {
        'refined/border-radius-with-curve': 'error',
        'refined/prefer-hairline-width': 'error',
        'refined/prefer-box-shadow': 'error',
        'refined/require-hitslop-small-touchables': 'error',
        'refined/spring-config-consistency': 'error',
        'refined/avoid-touchable-opacity': 'error',
      },
    },
  },
};

export = plugin;
