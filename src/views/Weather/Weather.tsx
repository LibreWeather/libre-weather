import React from 'react';
import CurrentWeather from '@components/CurrentWeather';
import DailyOverview from '@components/DailyOverview';
import ForecastError from '@components/ForecastError';
import WeatherAlerts, { AlertsCoverageNote } from '@components/WeatherAlerts';
import WeeklyForecast from '@components/WeeklyForecast';
import type { NominatimResponse } from '@/models/place';
import { ForecastOutageProvider, useCurrent, useDaily, useHourly } from '@/providers/ForecastProviders';
import { usePlace } from '@/providers/PlaceProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { pageClass } from '@/common/layout';
import { backendLabel, forecastIsDown, mismatchedBackend, type Backend, type BackendPref } from '@/utilities/backend';
import { placeLabel } from '@/utilities/place';

const errorClass =
  'weatherError forecast-col mb-5 flex items-center justify-between gap-3 rounded-[0.625rem] border ' +
  'border-[rgb(255_120_120/0.25)] bg-[rgb(255_90_90/0.08)] px-3.5 py-2.5 text-base';

const LocationNotFound = () => (
  <div className={errorClass} role="alert">
    <span>Couldn&apos;t find that location. Enter a ZIP or postal code above.</span>
  </div>
);

const LocationPicker = ({
  options,
  onChoose,
}: {
  options: NominatimResponse[];
  onChoose: (option: NominatimResponse) => void;
}) => (
  <section
    className="locationPicker forecast-col mb-6 rounded-xl border border-white/8 bg-clear/70 p-4 text-base"
    aria-labelledby="locationPicker-title">
    <h2 id="locationPicker-title" className="locationPicker-title mb-3 text-xl">
      Which {options[0]?.address.postcode ?? 'place'} did you mean?
    </h2>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-2">
      {options.map((option) => (
        <button
          type="button"
          className={
            'locationPicker-option rounded-lg border border-white/10 bg-white/4 px-3 py-2.5 text-left ' +
            'transition-colors hover:border-white/25 hover:bg-white/9 focus-visible:border-white/25 ' +
            'focus-visible:bg-white/9 focus-visible:outline-none'
          }
          key={option.place_id ?? `${option.lat},${option.lon}`}
          onClick={() => onChoose(option)}>
          {placeLabel(option.address)}
        </button>
      ))}
    </div>
  </section>
);

const warnClass =
  'forecast-col mb-5 rounded-[0.625rem] border border-[rgb(240_190_90/0.35)] bg-[rgb(240_190_90/0.1)] ' +
  'px-3.5 py-2.5 text-base';

const BackendWarning = ({ sent, served }: { sent: BackendPref; served: Backend }) => (
  <div className={warnClass} role="status">
    {backendLabel(sent)} settings were not used. This forecast is from {backendLabel(served)}.
  </div>
);

const WeatherView = () => {
  const place = usePlace();
  const { preferences } = usePreferences();
  const current = useCurrent();
  const hourly = useHourly();
  const daily = useDaily();
  const outage = forecastIsDown([
    { status: current.status, hasData: current.current != null },
    { status: hourly.status, hasData: hourly.hourly != null },
    { status: daily.status, hasData: daily.daily != null },
  ]);
  const mismatch = mismatchedBackend(preferences.backend, [current.backend, hourly.backend, daily.backend]);
  const retryAll = () => {
    current.retry();
    hourly.retry();
    daily.retry();
  };

  let notice: React.ReactNode = null;
  if (place.status === 'failed') notice = <LocationNotFound />;
  else if (place.status === 'choosing') {
    notice = <LocationPicker options={place.options} onChoose={place.chooseLocation} />;
  }

  return (
    <ForecastOutageProvider outage={outage}>
      <div className={`header ${pageClass}`}>
        {notice}
        {mismatch ? <BackendWarning sent={preferences.backend} served={mismatch} /> : null}
        {outage ? <ForecastError onRetry={retryAll} label="the forecast" /> : null}
        <CurrentWeather />
        <WeatherAlerts />
        <DailyOverview />
        <WeeklyForecast />
        <AlertsCoverageNote />
      </div>
    </ForecastOutageProvider>
  );
};

export default WeatherView;
