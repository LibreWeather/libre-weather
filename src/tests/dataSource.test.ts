import { activeSource, resolveDataSource } from '@/api/sources';
import { openMeteoUrl } from '@/api/sources/openMeteo';
import pirateWeather, { pirateForecastUrl } from '@/api/sources/pirateWeather';
import { weatherRequest } from '@/api/weather';
import { Condition, UnitSystem, VolumeUnit } from '@/models/weather';

const query = {
  coords: { lat: 39.1, lon: -94.58 },
  units: UnitSystem.METRIC,
  part: 'hourly' as const,
  tz: 'America/Chicago',
};

describe('resolveDataSource', () => {
  const choice = { source: 'auto' as const, pirateWeatherKey: '' };

  test('auto keeps the LibreWeather API when one is configured', () => {
    expect(resolveDataSource(choice, { apiRoot: 'https://api.example.com/weather' })).toBe('libre');
  });

  test('auto calls Open-Meteo directly when no API is configured', () => {
    expect(resolveDataSource(choice, {})).toBe('open-meteo');
  });

  test('an explicit source wins, and Pirate Weather stays unready until a key is saved', () => {
    expect(resolveDataSource({ source: 'pirate-weather', pirateWeatherKey: '' }, { apiRoot: 'https://api' })).toBe(
      'pirate-weather'
    );
    const missing = activeSource({ source: 'pirate-weather', pirateWeatherKey: '  ' }, { apiRoot: 'https://api' });
    expect(missing.ready).toBe(false);
    expect(missing.provider.request(query, { source: 'pirate-weather', pirateWeatherKey: '  ' }, {})).toBeNull();
    const ready = activeSource({ source: 'pirate-weather', pirateWeatherKey: 'secret-key' }, {});
    expect(ready.ready).toBe(true);
  });
});

describe('libre requests', () => {
  test('still ask the LibreWeather API for one slice', () => {
    const choice = { source: 'libre' as const, pirateWeatherKey: '' };
    const provider = activeSource(choice, { apiRoot: 'https://api.example.com/weather' }).provider;
    expect(provider.request(query, choice, { apiRoot: 'https://api.example.com/weather' })).toEqual(
      weatherRequest(query.coords, query.units, query.part, 'https://api.example.com/weather')
    );
  });
});

describe('open-meteo', () => {
  test('requests one slice in the browser time zone', () => {
    const url = openMeteoUrl({ ...query, part: 'current' });
    expect(url.startsWith('https://api.open-meteo.com/v1/forecast?')).toBe(true);
    expect(url).toContain('latitude=39.1');
    expect(url).toContain('current=');
    expect(url).toContain('daily=sunrise%2Csunset');
    expect(url).toContain('timezone=America%2FChicago');
    expect(url).toContain('temperature_unit=celsius');
    expect(openMeteoUrl(query)).toContain('hourly=');
    expect(openMeteoUrl(query)).not.toContain('current=');
  });

  test('maps a current block into the forecast model', () => {
    const provider = activeSource({ source: 'open-meteo', pirateWeatherKey: '' }, {}).provider;
    const parsed = provider.parse('current', {
      current: {
        time: '2026-11-13T14:00',
        temperature_2m: 21,
        apparent_temperature: 19,
        dew_point_2m: 10,
        relative_humidity_2m: 55,
        pressure_msl: 1012,
        weather_code: 61,
        cloud_cover: 80,
        wind_speed_10m: 4,
        wind_direction_10m: 180,
        uv_index: 2,
      },
      daily: { sunrise: ['2026-11-13T07:00'], sunset: ['2026-11-13T17:00'] },
    }, UnitSystem.METRIC) as { current: { condition: Condition; description: string; humidity: number } };
    expect(parsed.current.condition).toBe(Condition.RAIN);
    expect(parsed.current.description).toBe('Slight rain');
    expect(parsed.current.humidity).toBe(55);
  });
});

describe('pirate weather', () => {
  test('builds a direct forecast URL and keeps the key out of the error label', () => {
    const { url, errorUrl } = pirateForecastUrl('secret-key', query);
    expect(url).toBe(
      'https://api.pirateweather.net/forecast/secret-key/39.1,-94.58?units=si&version=2&exclude=currently%2Cminutely%2Cdaily%2Calerts&extend=hourly'
    );
    expect(errorUrl).not.toContain('secret-key');
    expect(pirateForecastUrl('secret-key', { ...query, part: 'current', units: UnitSystem.IMPERIAL }).url).toContain(
      'units=us'
    );
  });

  test('maps Dark Sky blocks into the forecast model', () => {
    const body = {
      currently: {
        time: 1_700_000_000,
        summary: 'Rain',
        icon: 'rain',
        temperature: 12,
        apparentTemperature: 10,
        dewPoint: 8,
        humidity: 0.8,
        pressure: 1008,
        windSpeed: 3,
        windBearing: 90,
        uvIndex: 1,
        visibility: 10,
      },
      daily: { data: [{ sunriseTime: 1_700_000_100, sunsetTime: 1_700_040_000 }] },
      hourly: {
        data: [
          {
            time: 1_700_000_000,
            summary: 'Rain',
            icon: 'rain',
            temperature: 12,
            apparentTemperature: 10,
            dewPoint: 8,
            humidity: 0.5,
            pressure: 1008,
            cloudCover: 0.4,
            precipProbability: 0.7,
            precipIntensity: 1.5,
            liquidAccumulation: 0.2,
            snowAccumulation: 1,
            precipType: 'rain',
            windSpeed: 3,
            windGust: 6,
            windBearing: 90,
            uvIndex: 1,
            visibility: 10,
          },
        ],
      },
    };
    const current = pirateWeather.parse('current', body, UnitSystem.METRIC) as {
      current: { humidity: number; time: number; sunrise: number; condition: Condition };
    };
    expect(current.current.humidity).toBe(80);
    expect(current.current.time).toBe(1_700_000_000_000);
    expect(current.current.sunrise).toBe(1_700_000_100_000);
    expect(current.current.condition).toBe(Condition.RAIN);

    const hourly = pirateWeather.parse('hourly', body, UnitSystem.METRIC) as {
      hourly: {
        precipVolume: { value: number; unit: string };
        rainVolume: { value: number };
        snowVolume: { value: number };
        cloudCover: number;
      }[];
    };
    expect(hourly.hourly[0].precipVolume).toEqual({ value: 1.5, unit: VolumeUnit.MM });
    expect(hourly.hourly[0].rainVolume.value).toBe(2);
    expect(hourly.hourly[0].snowVolume.value).toBe(10);
    expect(hourly.hourly[0].cloudCover).toBe(40);
  });
});
