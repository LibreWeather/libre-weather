import { CONFIG_ASSIGNMENT, loadRuntimeConfig, matomoTarget, parseConfig } from '@/utilities/config';
import { syncMatomo } from '@/utilities/matomo';
import { analyticsSheetEligible, frontPrompt, hasPromptBehind, installBannerEligible } from '@/utilities/prompts';

const CONFIG = 'window.__CONFIG__ = {"matomoUrl":"https://matomo.example.com","matomoSiteId":"3"};\n';

describe('runtime config', () => {
  test('reads a Matomo server and site id', () => {
    expect(parseConfig(CONFIG)).toEqual({ matomoUrl: 'https://matomo.example.com', matomoSiteId: '3' });
    expect(matomoTarget(parseConfig(CONFIG))).toEqual({ base: 'https://matomo.example.com/', siteId: '3' });
  });

  test('keeps a url without a site id, and does not track with it', () => {
    const config = parseConfig(`${CONFIG_ASSIGNMENT}{"matomoUrl":"https://matomo.example.com/"};`);
    expect(config).toEqual({ matomoUrl: 'https://matomo.example.com/' });
    expect(matomoTarget(config)).toBeUndefined();
  });

  test('ignores the app shell and non-http urls', () => {
    expect(parseConfig('<!DOCTYPE html><html></html>')).toBeNull();
    expect(parseConfig('not config')).toBeNull();
    expect(matomoTarget({ matomoUrl: 'javascript:alert(1)', matomoSiteId: '1' })).toBeUndefined();
  });

  test('treats a missing file or the app shell as no config', async () => {
    window.fetch = jest.fn().mockResolvedValue({ ok: false, headers: { get: () => '' } });
    await expect(loadRuntimeConfig()).resolves.toBeNull();

    window.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'text/html' },
      text: async () => CONFIG,
    });
    await expect(loadRuntimeConfig()).resolves.toBeNull();
  });
});

describe('matomo', () => {
  afterEach(() => {
    document.querySelectorAll('script[data-matomo]').forEach((node) => node.remove());
    delete window._paq;
  });

  const config = { matomoUrl: 'https://matomo.example.com', matomoSiteId: '3' };

  test('stays unloaded until usage sharing is on', () => {
    syncMatomo(config, false);
    expect(document.querySelector('script[data-matomo]')).toBeNull();

    syncMatomo(config, true);
    expect(document.querySelector('script[data-matomo]')).toHaveAttribute(
      'src',
      'https://matomo.example.com/matomo.js'
    );
    expect(window._paq).toEqual([
      ['trackPageView'],
      ['enableLinkTracking'],
      ['setTrackerUrl', 'https://matomo.example.com/matomo.php'],
      ['setSiteId', '3'],
    ]);
  });

  test('opts out and back in without loading the script twice', () => {
    syncMatomo(config, true);
    syncMatomo(config, false);
    syncMatomo(config, true);
    expect(document.querySelectorAll('script[data-matomo]')).toHaveLength(1);
    expect(window._paq?.slice(-2)).toEqual([['optUserOut'], ['forgetUserOptOut']]);
  });
});

describe('prompt stack', () => {
  test('shows the analytics sheet only when Matomo is configured and still unanswered', () => {
    const configured = { matomoUrl: 'https://matomo.example.com/', matomoSiteId: '1' };
    expect(analyticsSheetEligible(null, false)).toBe(false);
    expect(analyticsSheetEligible({ matomoUrl: 'https://matomo.example.com/' }, false)).toBe(false);
    expect(analyticsSheetEligible({ matomoSiteId: '1' }, false)).toBe(false);
    expect(analyticsSheetEligible(configured, false)).toBe(true);
    expect(analyticsSheetEligible(configured, true)).toBe(false);
  });

  test('shows install on top and analytics only after install is gone', () => {
    const both = { install: true, analytics: true };
    expect(frontPrompt(both)).toBe('install');
    expect(frontPrompt({ install: false, analytics: true })).toBe('analytics');
    expect(frontPrompt({ install: true, analytics: false })).toBe('install');
    expect(frontPrompt({ install: false, analytics: false })).toBeNull();
    expect(hasPromptBehind('install', both)).toBe(true);
    expect(hasPromptBehind('analytics', { install: false, analytics: true })).toBe(false);
  });

  test('offers install on iOS and when the browser can prompt, and not after dismissal', () => {
    expect(installBannerEligible({ dismissed: false, standalone: false, canPrompt: true, ios: false })).toBe(true);
    expect(installBannerEligible({ dismissed: false, standalone: false, canPrompt: false, ios: true })).toBe(true);
    expect(installBannerEligible({ dismissed: true, standalone: false, canPrompt: true, ios: true })).toBe(false);
    expect(installBannerEligible({ dismissed: false, standalone: true, canPrompt: true, ios: true })).toBe(false);
  });
});
