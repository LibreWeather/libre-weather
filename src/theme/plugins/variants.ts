import plugin from 'tailwindcss/plugin';

/** State classes PreferencesProvider and useHero set on <html>. */
export default plugin(({ addVariant }) => {
  addVariant('compact', '&:where(.compact *)');
  addVariant('hero-off', '&:where(.hero-offscreen *)');
  addVariant('reduce-transparency', '&:where(.reduce-transparency *)');
});
