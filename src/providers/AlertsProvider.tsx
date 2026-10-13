import React from 'react';

import { alertsRoot, type AlertsResponse, type WeatherAlert } from '../utilities/alertTypes';
import { usePlace } from './PlaceProvider';
import { usePreferences } from './PreferencesProvider';

const ALERTS_API_ROOT = alertsRoot(process.env.LIBRE_WEATHER_API, process.env.LIBRE_WEATHER_ALERTS_API);
const REFRESH_MS = 5 * 60 * 1000;

export type AlertsStatus = 'idle' | 'loading' | 'ready' | 'error';

export type AlertsContextValue = {
  alerts: WeatherAlert[];
  coverage: boolean | null;
  sources: AlertsResponse['sources'];
  status: AlertsStatus;
};

const AlertsContext = React.createContext<AlertsContextValue | null>(null);

export const AlertsProvider = ({ children }: { children: React.ReactNode }) => {
  const { coords } = usePlace();
  const {
    preferences: { alerts: enabled },
  } = usePreferences();
  const [data, setData] = React.useState<AlertsResponse | null>(null);
  const [status, setStatus] = React.useState<AlertsStatus>('idle');

  React.useEffect(() => {
    setData(null);
    if (!enabled || !coords || !ALERTS_API_ROOT) {
      setStatus('idle');
      return undefined;
    }

    let controller: AbortController | null = null;
    const load = () => {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      setStatus((current) => (current === 'ready' ? current : 'loading'));
      fetch(`${ALERTS_API_ROOT}/${coords.lat},${coords.lon}`, { signal })
        .then((res) => {
          if (!res.ok) throw new Error(`Alerts request failed: ${res.status}`);
          return res.json();
        })
        .then((body: AlertsResponse) => {
          setData(body);
          setStatus('ready');
        })
        .catch((error) => {
          if (signal.aborted) return;
          console.warn(error);
          setStatus('error');
        });
    };

    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => {
      window.clearInterval(timer);
      controller?.abort();
    };
  }, [coords, enabled]);

  const value = React.useMemo<AlertsContextValue>(() => {
    const now = Date.now();
    return {
      alerts: (data?.alerts ?? []).filter((alert) => !alert.expires || alert.expires > now),
      coverage: data ? data.coverage : null,
      sources: data?.sources ?? [],
      status,
    };
  }, [data, status]);

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
};

export const useAlerts = () => {
  const context = React.useContext(AlertsContext);
  if (!context) throw new Error('useAlerts must be used inside an AlertsProvider');
  return context;
};
