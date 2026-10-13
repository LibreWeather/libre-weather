import React from 'react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.less';

import NavigationBar from './components/NavigationBar';
import { AlertsProvider } from './providers/AlertsProvider';
import { PlaceProvider } from './providers/PlaceProvider';
import { WeatherProvider } from './providers/WeatherProvider';
import Licenses from './views/Licenses';
import Weather from './views/Weather/Weather';

const App = () => (
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
          </div>
        </BrowserRouter>
      </AlertsProvider>
    </WeatherProvider>
  </PlaceProvider>
);

export default App;
