import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.less';

import InstallBanner from './components/InstallBanner/InstallBanner';
import NavigationBar from './components/NavigationBar';
import { AlertsProvider } from './providers/AlertsProvider';
import { PlaceProvider } from './providers/PlaceProvider';
import { PreferencesProvider } from './providers/PreferencesProvider';
import { WeatherProvider } from './providers/WeatherProvider';
import Licenses from './views/Licenses';
import Weather from './views/Weather/Weather';

const App = () => (
  <PreferencesProvider>
    <PlaceProvider>
      <WeatherProvider>
        <AlertsProvider>
          <BrowserRouter>
            <div className="App">
              <NavigationBar />
              <Routes>
                <Route path="/" element={<Weather />} />
                <Route path="/licenses" element={<Licenses />} />
              </Routes>
              <InstallBanner />
            </div>
          </BrowserRouter>
        </AlertsProvider>
      </WeatherProvider>
    </PlaceProvider>
  </PreferencesProvider>
);

export default App;
