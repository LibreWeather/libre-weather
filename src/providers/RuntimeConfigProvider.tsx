import React from 'react';

import type { RuntimeConfig } from '@/utilities/config';
import { loadRuntimeConfig } from '@/utilities/config';
import { syncMatomo } from '@/utilities/matomo';
import { usePreferences } from './PreferencesProvider';

type RuntimeConfigValue = {
  /** False until the first `/config.js` read settles. */
  ready: boolean;
  config: RuntimeConfig | null;
};

const RuntimeConfigContext = React.createContext<RuntimeConfigValue | null>(null);

export const RuntimeConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const { preferences } = usePreferences();
  const [ready, setReady] = React.useState(false);
  const [config, setConfig] = React.useState<RuntimeConfig | null>(null);

  React.useEffect(() => {
    let cancel = false;
    loadRuntimeConfig().then((value) => {
      if (cancel) return;
      setConfig(value);
      setReady(true);
    });
    return () => {
      cancel = true;
    };
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    syncMatomo(config, preferences.analytics);
  }, [ready, config, preferences.analytics]);

  const value = React.useMemo(() => ({ ready, config }), [ready, config]);
  return <RuntimeConfigContext.Provider value={value}>{children}</RuntimeConfigContext.Provider>;
};

export const useRuntimeConfig = () => {
  const context = React.useContext(RuntimeConfigContext);
  if (!context) throw new Error('useRuntimeConfig must be used inside a RuntimeConfigProvider');
  return context;
};
