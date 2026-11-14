/** Where a forecast slice is loaded from. */
export type DataSourceId = 'libre' | 'open-meteo' | 'pirate-weather';

/** `auto` uses the LibreWeather API when it is configured, and Open-Meteo otherwise. */
export type DataSourcePref = 'auto' | DataSourceId;
