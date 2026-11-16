import React from 'react';

import NavigationBar from '@components/NavigationBar';
import PromptStack from '@components/Prompts';
import { useLocation } from '@/hooks/useLocation';
import { AlertsProvider } from '@/providers/AlertsProvider';
import { CurrentProvider, DailyProvider, HourlyProvider } from '@/providers/ForecastProviders';
import { PlaceProvider } from '@/providers/PlaceProvider';
import { PreferencesProvider } from '@/providers/PreferencesProvider';
import { RuntimeConfigProvider } from '@/providers/RuntimeConfigProvider';
import Weather from './views/Weather/Weather';

/** Split out: the license list is large and rarely visited. */
const Licenses = React.lazy(() => import('./views/Licenses'));

const Page = () => {
  const { pathname } = useLocation();
  if (pathname === '/licenses') {
    return (
      <React.Suspense fallback={null}>
        <Licenses />
      </React.Suspense>
    );
  }
  return <Weather />;
};

const App = () => (
  <PreferencesProvider>
    <RuntimeConfigProvider>
      <PlaceProvider>
        <CurrentProvider>
          <HourlyProvider>
            <DailyProvider>
              <AlertsProvider>
                <div className="overflow-x-clip">
                  <NavigationBar />
                  <Page />
                  <PromptStack />
                </div>
              </AlertsProvider>
            </DailyProvider>
          </HourlyProvider>
        </CurrentProvider>
      </PlaceProvider>
    </RuntimeConfigProvider>
  </PreferencesProvider>
);

export default App;
