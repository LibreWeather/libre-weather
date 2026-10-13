import React from 'react';

import { ALERTS_API_ROOT, alertsRequest } from '@/api/alerts';
import { useFetch } from '@/hooks/useFetch';
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
};

const AlertsContext = React.createContext<AlertsContextValue | null>(null);

const logWarning = (error: Error) => console.warn(error);

export const AlertsProvider = ({ children }: { children: React.ReactNode }) => {
  const { coords } = usePlace();
  const {
    preferences: { alerts: enabled },
  } = usePreferences();
  const request = enabled && coords && ALERTS_API_ROOT ? alertsRequest(coords) : null;
  const [{ data, loading, error }, refetch] = useFetch<AlertsResponse>(request, { onError: logWarning });

  React.useEffect(() => {
    if (!request) return undefined;
    const timer = window.setInterval(() => refetch(), REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [request, refetch]);

  // Background refreshes keep showing the current alerts as `ready`.
  let status: LoadStatus = 'idle';
  if (error) status = 'error';
  else if (data) status = 'ready';
  else if (loading) status = 'loading';

  const value = React.useMemo<AlertsContextValue>(
    () => ({
      alerts: activeAlerts(data?.alerts ?? []),
      coverage: data ? data.coverage : null,
      sources: data?.sources ?? [],
      status,
    }),
    [data, status]
  );

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
};

export const useAlerts = () => {
  const context = React.useContext(AlertsContext);
  if (!context) throw new Error('useAlerts must be used inside an AlertsProvider');
  return context;
};
