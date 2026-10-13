import React from 'react';
import Button from 'react-bootstrap/Button';
import CurrentWeather from '@components/CurrentWeather/CurrentWeather';
import DailyOverview from '@components/DailyOverview/DailyOverview';
import WeatherAlerts, { AlertsCoverageNote } from '@components/WeatherAlerts/WeatherAlerts';
import WeatherSkeleton from '@components/WeatherSkeleton/WeatherSkeleton';
import { usePreferences } from '../../providers/PreferencesProvider';
import WeeklyForecast from '@components/WeeklyForecast/WeeklyForecast';
import { placeLabel, type NominatimResponse } from '@/utilities/nominatim';
import { usePlace } from '../../providers/PlaceProvider';
import { useWeather } from '../../providers/WeatherProvider';

import './Weather.less';

const LocationNotFound = () => (
  <div className="weatherError forecast-col" role="alert">
    <span>Couldn&apos;t find that location. Enter a ZIP or postal code above.</span>
  </div>
);

const WeatherFailed = ({ onRetry }: { onRetry: () => void }) => (
  <div className="weatherError forecast-col" role="alert">
    <span>Couldn&apos;t load the forecast.</span>
    <Button size="sm" variant="outline-light" onClick={onRetry}>
      Try again
    </Button>
  </div>
);

const LocationPicker = ({
  options,
  onChoose,
}: {
  options: NominatimResponse[];
  onChoose: (option: NominatimResponse) => void;
}) => (
  <section className="locationPicker forecast-col" aria-labelledby="locationPicker-title">
    <h2 id="locationPicker-title" className="locationPicker-title">
      Which {options[0]?.address.postcode ?? 'place'} did you mean?
    </h2>
    <div className="locationPicker-options">
      {options.map((option) => (
        <button
          type="button"
          className="locationPicker-option"
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
  const { weather, status, retry } = useWeather();
  // Time labels come from plain formatters; subscribing re-renders them when the clock preference changes.
  usePreferences();

  const choosing = place.status === 'choosing';
  const loading = place.status === 'resolving' || (place.status === 'resolved' && status === 'loading');

  let notice: React.ReactNode = null;
  if (place.status === 'failed') notice = <LocationNotFound />;
  else if (choosing) notice = <LocationPicker options={place.options} onChoose={place.chooseLocation} />;
  else if (status === 'error') notice = <WeatherFailed onRetry={retry} />;

  if (!weather) {
    return (
      <div className="header">
        {notice}
        <WeatherSkeleton animated={loading}>
          <WeatherAlerts />
        </WeatherSkeleton>
      </div>
    );
  }

  return (
    <div className={`header${loading ? ' is-refreshing' : ''}`} aria-busy={loading}>
      {notice}
      <CurrentWeather weatherData={weather} />
      <WeatherAlerts />
      <DailyOverview hourlyWeatherData={weather.hourly} />
      <WeeklyForecast weatherData={weather} />
      <AlertsCoverageNote />
    </div>
  );
};

export default WeatherView;
