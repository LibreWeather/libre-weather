/** Breakpoints in rem; `md` is Tailwind's default, the rest override it. */
export const BREAKPOINTS = {
  md: 48,
  lg: 62,
  xl: 75,
  '2xl': 87.5,
} as const;

export const FONTS = {
  sans: ['Inter Variable', 'sans-serif'],
  serif: ['Source Serif 4 Variable', 'serif'],
  mono: ['Source Code Pro Variable', 'ui-monospace', 'monospace'],
};

export const COLORS = {
  page: '#282c34',
  clear: '#202224',
  'partly-cloudy': '#2c3032',
  'mostly-cloudy': '#343d4a',
  rain: '#2e5a94',
  panel: '#23262b',
  accent: '#3b82f6',
  muted: '#6c757d',
  field: '#212529',
  'field-addon': '#2b3035',
  'field-border': '#495057',
  'field-text': '#dee2e6',
  focus: '#86b7fe',
};
