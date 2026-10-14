import type { Config } from 'tailwindcss';
import base from './plugins/base';
import utilities from './plugins/utilities';
import variants from './plugins/variants';
import { BREAKPOINTS, COLORS, FONTS } from './tokens';

export default {
  content: [],
  theme: {
    extend: {
      screens: Object.fromEntries(Object.entries(BREAKPOINTS).map(([name, rem]) => [name, `${rem}rem`])),
      fontFamily: FONTS,
      colors: COLORS,
    },
  },
  plugins: [base, utilities, variants],
} satisfies Config;
