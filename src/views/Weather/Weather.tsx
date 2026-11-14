import React from 'react';
import CurrentWeather from '@components/CurrentWeather';
import DailyOverview from '@components/DailyOverview';
import WeatherAlerts, { AlertsCoverageNote } from '@components/WeatherAlerts';
import WeeklyForecast from '@components/WeeklyForecast';
import type { NominatimResponse } from '@/models/place';
import { usePlace } from '@/providers/PlaceProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { pageClass } from '@/common/layout';
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

const WeatherView = () => {
  const place = usePlace();
  // Time labels come from plain formatters; subscribing re-renders them when the clock preference changes.
  usePreferences();

  let notice: React.ReactNode = null;
  if (place.status === 'failed') notice = <LocationNotFound />;
  else if (place.status === 'choosing') {
    notice = <LocationPicker options={place.options} onChoose={place.chooseLocation} />;
  }

  return (
    <div className={`header ${pageClass}`}>
      {notice}
      <CurrentWeather />
      <WeatherAlerts />
      <DailyOverview />
      <WeeklyForecast />
      <AlertsCoverageNote />
    </div>
  );
};

export default WeatherView;
