import plugin from 'tailwindcss/plugin';

export const NUMERIC_FEATURES = '"tnum" 1, "zero" 1';
export const TEXT_FEATURES = '"tnum" 1, "cv05" 1';

export default plugin(({ addUtilities, theme }) => {
  addUtilities({
    '.forecast-col': {
      width: '100%',
      'max-width': '48em',
      'margin-inline': 'auto',
    },
    '.type-data': {
      'font-family': theme('fontFamily.mono'),
      'font-feature-settings': NUMERIC_FEATURES,
    },
    '.type-label': {
      'font-family': theme('fontFamily.sans'),
      'font-feature-settings': TEXT_FEATURES,
    },
  });
});
