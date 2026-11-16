import React from 'react';
import { faArrowUpFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';
import { focusRing, PromptSheet } from '@components/Prompts/PromptSheet';

import { usePreferences } from '@/providers/PreferencesProvider';
import { appleTouchIconHref } from '@/utilities/platform';

type InstallBannerProps = {
  canPrompt: boolean;
  install: () => Promise<'accepted' | 'dismissed' | null>;
};

const InstallBanner = ({ canPrompt, install }: InstallBannerProps) => {
  const { setPreference } = usePreferences();
  const [icon] = React.useState(appleTouchIconHref);
  const dismiss = React.useCallback(() => setPreference('installBannerDismissed', true), [setPreference]);

  const onInstall = async () => {
    if ((await install()) === 'accepted') dismiss();
  };

  return (
    <PromptSheet className="installBanner" label="Install Libre Weather">
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
          className={
            `flex-none rounded-[0.55rem] bg-accent px-[0.95rem] py-[0.45rem] font-semibold text-white ` +
            `hover:bg-[#2f6fd8] ${focusRing}`
          }
          onClick={onInstall}>
          Install
        </button>
      ) : null}
      <button
        type="button"
        className={
          `installBanner-dismiss grid size-8 flex-none place-items-center rounded-lg text-white/60 ` +
          `hover:bg-white/8 hover:text-white ${focusRing}`
        }
        aria-label="Dismiss"
        onClick={dismiss}>
        <Icon icon={faXmark} />
      </button>
    </PromptSheet>
  );
};

export default InstallBanner;
