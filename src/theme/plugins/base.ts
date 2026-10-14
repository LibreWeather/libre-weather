import plugin from 'tailwindcss/plugin';
import { COLORS } from '../tokens';
import { NUMERIC_FEATURES, TEXT_FEATURES } from './utilities';

/** Root font size steps up on large screens so rem-based layouts scale. */
const ROOT_FONT_SIZES: [minWidth: number, size: number][] = [
  [1600, 18],
  [2200, 20],
  [3000, 24],
];

export default plugin(({ addBase, theme }) => {
  addBase({
    // Tailwind inlines config colours, so SCSS reads them from these instead.
    ':root': Object.fromEntries(Object.entries(COLORS).map(([name, value]) => [`--color-${name}`, value])),
    html: {
      '-webkit-text-size-adjust': '100%',
      '-webkit-tap-highlight-color': 'transparent',
      ...Object.fromEntries(
        ROOT_FONT_SIZES.map(([minWidth, size]) => [`@media (min-width: ${minWidth}px)`, { 'font-size': `${size}px` }])
      ),
    },
    body: {
      'background-color': theme('colors.page'),
      color: '#fff',
      'font-optical-sizing': 'auto',
      'font-feature-settings': TEXT_FEATURES,
      'font-weight': '430',
      '-webkit-font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale',
    },
    'h1, h2, h3': {
      'font-family': theme('fontFamily.serif'),
      'font-weight': '600',
      'letter-spacing': '-0.02em',
      'line-height': '1.2',
    },
    'h4, h5, h6': {
      'font-weight': '500',
      'line-height': '1.2',
    },
    code: {
      'font-family': theme('fontFamily.mono'),
      'font-feature-settings': NUMERIC_FEATURES,
    },
    'button:not(:disabled), [role="button"]:not(:disabled)': {
      cursor: 'pointer',
    },
  });

  // Base-layer !important outranks !important in the utilities layer.
  addBase({
    'html.reduce-transparency *, html.reduce-transparency *::backdrop': {
      'backdrop-filter': 'none !important',
    },
    'html.reduce-motion *, html.reduce-motion *::before, html.reduce-motion *::after': {
      'animation-duration': '0.01ms !important',
      'animation-iteration-count': '1 !important',
      'transition-duration': '0.01ms !important',
      'scroll-behavior': 'auto !important',
    },
  });
});
