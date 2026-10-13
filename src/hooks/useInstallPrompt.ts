import { useCallback, useEffect, useState } from 'react';
import type { InstallPromptEvent } from '@/models/install';

/**
 * Captures the browser's install prompt so it can be shown from our own button.
 * @param {() => void} onInstalled called once the app is installed, by any route
 * @returns {{ canPrompt: boolean, install: () => Promise<'accepted' | 'dismissed' | null> }}
 */
export const useInstallPrompt = (onInstalled: () => void) => {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [onInstalled]);

  const install = useCallback(async () => {
    if (!promptEvent) return null;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setPromptEvent(null);
    return outcome;
  }, [promptEvent]);

  return { canPrompt: promptEvent != null, install };
};
