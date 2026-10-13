import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons';

import { usePreferences } from '../../providers/PreferencesProvider';

import './InstallBanner.less';

/** Chromium's `beforeinstallprompt` event; not in the DOM typings. */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export const isStandalone = () =>
  Boolean(window.matchMedia?.('(display-mode: standalone)').matches) ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** iOS browsers never fire `beforeinstallprompt`; installing goes through Safari's share sheet. */
const isIos = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const InstallBanner = () => {
  const { preferences, setPreference } = usePreferences();
  const [standalone] = React.useState(isStandalone);
  const dismissed = preferences.installBannerDismissed || standalone;
  const [promptEvent, setPromptEvent] = React.useState<InstallPromptEvent | null>(null);
  const [ios] = React.useState(isIos);
  const [icon] = React.useState(
    () => document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')?.href ?? null
  );

  React.useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => setPreference('installBannerDismissed', true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [setPreference]);

  if (dismissed || (!promptEvent && !ios)) return null;

  const dismiss = () => setPreference('installBannerDismissed', true);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setPromptEvent(null);
    if (outcome === 'accepted') dismiss();
  };

  return (
    <aside className="installBanner" aria-label="Install Libre Weather">
      {icon ? <img className="installBanner-icon" src={icon} alt="" /> : null}
      <div className="installBanner-text">
        <strong>Install Libre Weather</strong>
        {promptEvent ? (
          <span>Open it from your home screen or dock, even offline.</span>
        ) : (
          <span>
            Tap <FontAwesomeIcon icon={faArrowUpFromBracket} aria-label="Share" /> then <b>Add to Home Screen</b>.
          </span>
        )}
      </div>
      {promptEvent ? (
        <button type="button" className="installBanner-install" onClick={install}>
          Install
        </button>
      ) : null}
      <button type="button" className="installBanner-dismiss" aria-label="Dismiss" onClick={dismiss}>
        <FontAwesomeIcon icon={faXmark} />
      </button>
    </aside>
  );
};

export default InstallBanner;
