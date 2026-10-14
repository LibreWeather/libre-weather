import React from 'react';

import InstallBanner from '@components/InstallBanner';
import NavigationBar from '@components/NavigationBar';
import { useLocation } from '@/hooks/useLocation';
import { AlertsProvider } from '@/providers/AlertsProvider';
import { PlaceProvider } from '@/providers/PlaceProvider';
import { PreferencesProvider } from '@/providers/PreferencesProvider';
import { WeatherProvider } from '@/providers/WeatherProvider';
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
    <PlaceProvider>
      <WeatherProvider>
        <AlertsProvider>
          <div className="overflow-x-clip">
            <NavigationBar />
            <Page />
            <InstallBanner />
          </div>
        </AlertsProvider>
      </WeatherProvider>
    </PlaceProvider>
  </PreferencesProvider>
);

export default App;
