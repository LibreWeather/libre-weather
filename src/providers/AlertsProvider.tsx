import React from 'react';

import { ALERTS_API_ROOT, alertsRequest } from '@/api/alerts';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import type { AlertsResponse, WeatherAlert } from '@/models/alerts';
import type { LoadStatus } from '@/models/status';
import { activeAlerts } from '@/utilities/alerts';
import { usePlace } from './PlaceProvider';
import { usePreferences } from './PreferencesProvider';

const REFRESH_MS = 5 * 60 * 1000;

export type AlertsContextValue = {
  alerts: WeatherAlert[];
  coverage: boolean | null;
  sources: AlertsResponse['sources'];
  status: LoadStatus;
  stale: boolean;
};

const AlertsContext = React.createContext<AlertsContextValue | null>(null);

const logWarning = (error: Error) => console.warn(error);

export const AlertsProvider = ({ children }: { children: React.ReactNode }) => {
  const { coords } = usePlace();
  const {
    preferences: { alerts: enabled },
  } = usePreferences();
  const request = enabled && coords && ALERTS_API_ROOT ? alertsRequest(coords) : null;
  const { data, status, stale } = useAutoRefresh<AlertsResponse>(request, {
    intervalMs: REFRESH_MS,
    onError: logWarning,
  });

  const value = React.useMemo<AlertsContextValue>(
    () => ({
      // useAutoRefresh holds the last payload after the request is cleared. Turning alerts off must drop it.
      alerts: enabled ? activeAlerts(data?.alerts ?? []) : [],
      coverage: enabled && data ? data.coverage : null,
      sources: enabled ? (data?.sources ?? []) : [],
      status: enabled ? status : 'idle',
      stale: enabled && stale,
    }),
    [data, enabled, status, stale]
  );

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
};

export const useAlerts = () => {
  const context = React.useContext(AlertsContext);
  if (!context) throw new Error('useAlerts must be used inside an AlertsProvider');
  return context;
};
