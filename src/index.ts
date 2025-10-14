import borderRadiusWithCurve from './rules/border-radius-with-curve';
import preferHairlineWidth from './rules/prefer-hairline-width';
import preferBoxShadow from './rules/prefer-box-shadow';

const plugin = {
  meta: {
    name: 'eslint-plugin-refined',
    version: '0.1.0',
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
