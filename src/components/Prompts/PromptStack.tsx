import React from 'react';

import InstallBanner from '@components/InstallBanner';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { useRuntimeConfig } from '@/providers/RuntimeConfigProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { isIos, isStandalone } from '@/utilities/platform';
import { analyticsSheetEligible, frontPrompt, hasPromptBehind, installBannerEligible } from '@/utilities/prompts';
import AnalyticsBanner from './AnalyticsBanner';

const stack =
  'promptStack fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[1030] ' +
  'w-[min(30rem,calc(100vw_-_2rem))] -translate-x-1/2';

const PromptStack = () => {
  const { preferences, setPreference } = usePreferences();
  const { ready, config } = useRuntimeConfig();
  const [standalone] = React.useState(isStandalone);
  const [ios] = React.useState(isIos);
  const dismissInstall = React.useCallback(() => setPreference('installBannerDismissed', true), [setPreference]);
  const { canPrompt, install } = useInstallPrompt(dismissInstall);

  const showAnalytics = analyticsSheetEligible(ready ? config : null, preferences.analyticsAsked);
  const eligible = {
    install: installBannerEligible({
      dismissed: preferences.installBannerDismissed,
      standalone,
      canPrompt,
      ios,
    }),
    analytics: showAnalytics,
  };
  const front = frontPrompt(eligible);

  const decline = () => {
    setPreference('analytics', false);
    setPreference('analyticsAsked', true);
  };
  const allow = () => {
    setPreference('analytics', true);
    setPreference('analyticsAsked', true);
  };

  if (!front) return null;

  return (
    <div className={stack}>
      {hasPromptBehind(front, eligible) ? <div className="promptStack-under" aria-hidden="true" /> : null}
      {front === 'install' ? <InstallBanner canPrompt={canPrompt} install={install} /> : null}
      {front === 'analytics' && showAnalytics ? <AnalyticsBanner onAllow={allow} onDecline={decline} /> : null}
    </div>
  );
};

export default PromptStack;
