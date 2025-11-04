import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/enzomanuelmangano/eslint-plugin-refined/blob/main/docs/rules/${name}.md`
);

type MessageIds = 'preferBoxShadow';
type Options = [];

interface ShadowValues {
  color?: string;
  offsetX?: number;
  offsetY?: number;
  opacity?: number;
  radius?: number;
}

export = createRule<Options, MessageIds>({
  name: 'prefer-box-shadow',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer boxShadow over shadowColor, shadowOffset, shadowOpacity, and shadowRadius',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferBoxShadow: 'Use boxShadow instead of individual shadow properties (shadowColor, shadowOffset, shadowOpacity, shadowRadius) for better performance and simpler syntax',
    },
  },
  defaultOptions: [],
  create(context) {
    const shadowProperties = new Set([
      'shadowColor',
      'shadowOffset',
      'shadowOpacity',
      'shadowRadius',
      'elevation',
    ]);

    function parseColor(colorNode: TSESTree.Node): string | undefined {
      if (colorNode.type === 'Literal' && typeof colorNode.value === 'string') {
        return colorNode.value;
      }
      return undefined;
    }

    function parseShadowOffset(offsetNode: TSESTree.Node): { width?: number; height?: number } {
      if (offsetNode.type === 'ObjectExpression') {
        let width: number | undefined;
        let height: number | undefined;

        for (const prop of offsetNode.properties) {
          if (prop.type === 'Property' && prop.key.type === 'Identifier') {
            if (prop.key.name === 'width' && prop.value.type === 'Literal' && typeof prop.value.value === 'number') {
              width = prop.value.value;
            }
            if (prop.key.name === 'height' && prop.value.type === 'Literal' && typeof prop.value.value === 'number') {
              height = prop.value.value;
            }
          }
        }

        return { width, height };
      }
      return {};
    }

    function parseOpacity(opacityNode: TSESTree.Node): number | undefined {
      if (opacityNode.type === 'Literal' && typeof opacityNode.value === 'number') {
        return opacityNode.value;
      }
      return undefined;
    }

    function parseRadius(radiusNode: TSESTree.Node): number | undefined {
      if (radiusNode.type === 'Literal' && typeof radiusNode.value === 'number') {
        return radiusNode.value;
      }
      return undefined;
    }

    function convertToRgba(color: string, opacity: number): string {
      // Named color to RGB mapping
      const namedColors: Record<string, [number, number, number]> = {
        black: [0, 0, 0],
        white: [255, 255, 255],
        red: [255, 0, 0],
        green: [0, 128, 0],
        blue: [0, 0, 255],
        yellow: [255, 255, 0],
        cyan: [0, 255, 255],
        magenta: [255, 0, 255],
        gray: [128, 128, 128],
        grey: [128, 128, 128],
        orange: [255, 165, 0],
        purple: [128, 0, 128],
        brown: [165, 42, 42],
        pink: [255, 192, 203],
        transparent: [0, 0, 0],
      };

      // Handle named colors
      const lowerColor = color.toLowerCase();
      if (namedColors[lowerColor]) {
        const [r, g, b] = namedColors[lowerColor];
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }

      // Handle hex colors
      if (color.startsWith('#')) {
        const hex = color.substring(1);
        let r: number, g: number, b: number;

        if (hex.length === 3) {
          r = parseInt((hex[0] ?? '') + (hex[0] ?? ''), 16);
          g = parseInt((hex[1] ?? '') + (hex[1] ?? ''), 16);
          b = parseInt((hex[2] ?? '') + (hex[2] ?? ''), 16);
        } else if (hex.length === 6) {
          r = parseInt(hex.substring(0, 2), 16);
          g = parseInt(hex.substring(2, 4), 16);
          b = parseInt(hex.substring(4, 6), 16);
        } else {
          return color; // Invalid hex, return as is
        }

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }

      // If already rgba or rgb, try to modify opacity
      if (color.startsWith('rgba(')) {
        return color.replace(/,\s*[\d.]+\)$/, `, ${opacity})`);
      }

      if (color.startsWith('rgb(')) {
        return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
      }

      // For unknown formats, just use as is
      return color;
    }

    function buildBoxShadow(values: ShadowValues): string | null {
      const { color = '#000', offsetX = 0, offsetY = 0, opacity = 1, radius = 0 } = values;

      const finalColor = opacity !== 1 ? convertToRgba(color, opacity) : color;
      return `${offsetX}px ${offsetY}px ${radius}px ${finalColor}`;
    }

    function hasNonLiteralValue(node: TSESTree.Node): boolean {
      // Check if a value is non-literal (e.g., function call, identifier, expression)
      if (node.type === 'Literal') {
        return false;
      }
      if (node.type === 'ObjectExpression') {
        // Check all properties in the object
        for (const prop of node.properties) {
          if (prop.type === 'Property' && hasNonLiteralValue(prop.value)) {
            return true;
          }
        }
        return false;
      }
      return true; // CallExpression, Identifier, etc.
    }

    function checkStyleObject(node: TSESTree.ObjectExpression) {
      const shadowProps = new Map<string, TSESTree.Property>();
      let firstShadowProp: TSESTree.Property | null = null;

      // Collect all shadow properties
      for (const prop of node.properties) {
        if (prop.type === 'Property' && prop.key.type === 'Identifier') {
          const propName = prop.key.name;

          if (shadowProperties.has(propName)) {
            shadowProps.set(propName, prop);
            if (!firstShadowProp) {
              firstShadowProp = prop;
            }
          }
        }
      }

      // Only report if we have meaningful shadow properties
      // Skip if only elevation (Android-specific, can't be meaningfully converted without other properties)
      const hasNonElevationShadow = Array.from(shadowProps.keys()).some(
        prop => prop !== 'elevation'
      );

      if (!hasNonElevationShadow || !firstShadowProp) {
        return;
      }

      // Check if any shadow property has a non-literal value (e.g., dynamic/animated values)
      // If so, skip this rule entirely as we can't convert to static boxShadow
      for (const [propName, prop] of shadowProps) {
        if (propName !== 'elevation' && hasNonLiteralValue(prop.value)) {
          // Skip conversion for dynamic shadow values
          return;
        }
      }

      // Extract shadow values
      const values: ShadowValues = {};

      const colorProp = shadowProps.get('shadowColor');
      if (colorProp) {
        const parsedColor = parseColor(colorProp.value);
        if (parsedColor) {
          values.color = parsedColor;
        }
      }

      const offsetProp = shadowProps.get('shadowOffset');
      if (offsetProp) {
        const offset = parseShadowOffset(offsetProp.value);
        if (offset.width !== undefined) {
          values.offsetX = offset.width;
        }
        if (offset.height !== undefined) {
          values.offsetY = offset.height;
        }
      }

      const opacityProp = shadowProps.get('shadowOpacity');
      if (opacityProp) {
        const parsedOpacity = parseOpacity(opacityProp.value);
        if (parsedOpacity !== undefined) {
          values.opacity = parsedOpacity;
        }
      }

      const radiusProp = shadowProps.get('shadowRadius');
      if (radiusProp) {
        const parsedRadius = parseRadius(radiusProp.value);
        if (parsedRadius !== undefined) {
          values.radius = parsedRadius;
        }
      }

      const boxShadowValue = buildBoxShadow(values);

      context.report({
        node: firstShadowProp,
        messageId: 'preferBoxShadow',
        fix(fixer) {
          if (!boxShadowValue) {
            return null;
          }

          const sourceCode = context.sourceCode;

          // Build the replacement text - just replace the whole object with a new one
          const allProps = node.properties;
          const newProps = [];

          // Track if we've added boxShadow
          let boxShadowAdded = false;

          for (const prop of allProps) {
            if (prop.type === 'Property' && prop.key.type === 'Identifier') {
              const propName = prop.key.name;

              // Skip shadow properties
              if (shadowProperties.has(propName)) {
                // Add boxShadow in place of the first shadow property we encounter
                // Prefer shadowColor position if it exists, otherwise use first shadow prop
                if (!boxShadowAdded && (propName === 'shadowColor' || !shadowProps.has('shadowColor'))) {
                  newProps.push(`boxShadow: '${boxShadowValue}'`);
                  boxShadowAdded = true;
                }
                continue;
              }

              // Keep non-shadow properties
              newProps.push(sourceCode.getText(prop));
            } else if (prop.type === 'SpreadElement') {
              // Keep spread elements
              newProps.push(sourceCode.getText(prop));
            }
          }

          // Get indentation from the opening brace
          const openBrace = sourceCode.getFirstToken(node);
          const firstProp = allProps[0];
          if (!openBrace || !firstProp) {
            return null;
          }

          const textBetween = sourceCode.text.substring(openBrace.range[1], firstProp.range[0]);
          const match = textBetween.match(/\n(\s+)/);
          const indent: string = match?.[1] ?? '  ';

          // Build the new object content
          const newContent = newProps.join(',\n' + indent);

          // Calculate the closing indentation (one level less than properties)
          const closingIndent = indent.length >= 2 ? indent.slice(0, -2) : '';

          // Check if the original last property had a trailing comma
          const lastProp = allProps[allProps.length - 1];
          const tokenAfterLast = lastProp ? sourceCode.getTokenAfter(lastProp) : null;
          const hasTrailingComma = tokenAfterLast && tokenAfterLast.type === 'Punctuator' && tokenAfterLast.value === ',';

          // Replace the entire properties section
          const closeBrace = sourceCode.getLastToken(node);
          if (closeBrace) {
            return fixer.replaceTextRange(
              [firstProp.range[0], closeBrace.range[0]],
              newContent + (hasTrailingComma ? ',' : '') + '\n' + closingIndent
            );
          }

          return null;
        },
      });
    }

    return {
      ObjectExpression(node) {
        checkStyleObject(node);
      },
    };
  },
});
