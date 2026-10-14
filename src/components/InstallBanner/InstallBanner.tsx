import React from 'react';
import { faArrowUpFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';

import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { usePreferences } from '@/providers/PreferencesProvider';
import { appleTouchIconHref, isIos, isStandalone } from '@/utilities/platform';
import './InstallBanner.scss';

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const InstallBanner = () => {
  const { preferences, setPreference } = usePreferences();
  const [standalone] = React.useState(isStandalone);
  const [ios] = React.useState(isIos);
  const [icon] = React.useState(appleTouchIconHref);
  const dismiss = React.useCallback(() => setPreference('installBannerDismissed', true), [setPreference]);
  const { canPrompt, install } = useInstallPrompt(dismiss);

  if (preferences.installBannerDismissed || standalone || (!canPrompt && !ios)) return null;

  const onInstall = async () => {
    if ((await install()) === 'accepted') dismiss();
  };

  return (
    <aside
      className={
        'installBanner fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[1030] flex ' +
        'w-[min(30rem,calc(100vw_-_2rem))] -translate-x-1/2 items-center gap-3 rounded-[0.875rem] ' +
        'border border-white/10 bg-clear/94 py-[0.65rem] pr-[0.65rem] pl-3 text-left text-[0.9rem] text-white ' +
        'shadow-[0_0.75rem_2.5rem_rgb(0_0_0/0.45)] backdrop-blur-[10px] reduce-transparency:bg-clear'
      }
      aria-label="Install Libre Weather">
      {icon ? <img className="size-10 flex-none rounded-[0.6rem]" src={icon} alt="" /> : null}
      <div className="flex min-w-0 flex-1 flex-col leading-[1.35]">
        <strong>Install Libre Weather</strong>
        {canPrompt ? (
          <span className="text-[0.85em] text-white/70">Open it from your home screen or dock, even offline.</span>
        ) : (
          <span className="text-[0.85em] text-white/70">
            Tap <Icon icon={faArrowUpFromBracket} aria-label="Share" /> then <b>Add to Home Screen</b>.
          </span>
        )}
      </div>
      {canPrompt ? (
        <button
          type="button"
          className={`flex-none rounded-[0.55rem] bg-accent px-[0.95rem] py-[0.45rem] font-semibold text-white hover:bg-[#2f6fd8] ${focusRing}`}
          onClick={onInstall}>
          Install
        </button>
      ) : null}
      <button
        type="button"
        className={`installBanner-dismiss grid size-8 flex-none place-items-center rounded-lg text-white/60 hover:bg-white/8 hover:text-white ${focusRing}`}
        aria-label="Dismiss"
        onClick={dismiss}>
        <Icon icon={faXmark} />
      </button>
    </aside>
  );
};

export default InstallBanner;
