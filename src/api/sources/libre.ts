import { weatherRequest } from '@/api/weather';
import type { DataProvider } from './types';

/** The LibreWeather API. It already returns the forecast model, including OpenWeatherMap. */
const libre: DataProvider = {
  id: 'libre',

  ready(_choice, config) {
    return Boolean(config.apiRoot);
  },

  request(query, _choice, config) {
    if (!config.apiRoot) return null;
    return weatherRequest(query.coords, query.units, query.part, config.apiRoot);
  },

  parse(_part, body) {
    return body;
  },
};

export default libre;
