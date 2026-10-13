import React from 'react';
import { faArrowUpFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';

import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { usePreferences } from '@/providers/PreferencesProvider';
import { appleTouchIconHref, isIos, isStandalone } from '@/utilities/platform';

import './InstallBanner.less';

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
    <aside className="installBanner" aria-label="Install Libre Weather">
      {icon ? <img className="installBanner-icon" src={icon} alt="" /> : null}
      <div className="installBanner-text">
        <strong>Install Libre Weather</strong>
        {canPrompt ? (
          <span>Open it from your home screen or dock, even offline.</span>
        ) : (
          <span>
            Tap <Icon icon={faArrowUpFromBracket} aria-label="Share" /> then <b>Add to Home Screen</b>.
          </span>
        )}
      </div>
      {canPrompt ? (
        <button type="button" className="installBanner-install" onClick={onInstall}>
          Install
        </button>
      ) : null}
      <button type="button" className="installBanner-dismiss" aria-label="Dismiss" onClick={dismiss}>
        <Icon icon={faXmark} />
      </button>
    </aside>
  );
};

export default InstallBanner;
