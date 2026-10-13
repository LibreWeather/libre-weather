/**
 * Client copies of LibreWeather API types.
 * Keep in sync with api/src/api-spec/openapi.yaml and api/src/backend/Backend.js.
 *
 * @typedef {'RAIN'|'SNOW'|'SLEET'|'FOG'|'WIND'|'CLEAR'|'PARTLY_CLOUDY'|'CLOUDY'} Condition
 *
 * @typedef {Object} Temperature
 * @property {number|string} value
 * @property {'K'|'C'|'F'} unit
 *
 * @typedef {Object} Pressure
 * @property {number|string|null} value
 * @property {'MB'} unit
 *
 * @typedef {Object} Volume
 * @property {number|string|null} value
 * @property {'MM'|'IN'} unit
 *
 * @typedef {Object} Visibility
 * @property {number|string|null} value
 * @property {'M'|'MI'|'%'} unit
 *
 * @typedef {Object} WindSpeed
 * @property {number|string} magnitude
 * @property {number|string} direction
 * @property {'MS'|'MPH'} unit
 *
 * @typedef {Object} TempRange
 * @property {Temperature} min
 * @property {Temperature} max
 *
 * @typedef {Object} Current
 * @property {Temperature} apparentTemp
 * @property {Condition} condition
 * @property {string} [description]
 * @property {Temperature} dewPoint
 * @property {number} humidity
 * @property {Pressure} pressure
 * @property {string} [summary]
 * @property {number} sunrise
 * @property {number} sunset
 * @property {Temperature} temp
 * @property {number} time
 * @property {number} [uvIndex]
 * @property {Visibility} visibility
 * @property {WindSpeed} windspeed
 *
 * @typedef {Object} Daily
 * @property {TempRange} [apparentTemp]
 * @property {number} [cloudCover]
 * @property {Condition} condition
 * @property {number} [daylightDuration]
 * @property {string} description
 * @property {Temperature} [dewPoint]
 * @property {number} [humidity]
 * @property {number} [precipHours]
 * @property {number} [precipProbability]
 * @property {Pressure} [pressure]
 * @property {Volume} rainVolume
 * @property {Volume} snowVolume
 * @property {number} sunrise
 * @property {number} [sunshineDuration]
 * @property {number} sunset
 * @property {TempRange} temp
 * @property {number} time
 * @property {number} [uvIndex]
 * @property {WindSpeed} [windGust]
 * @property {WindSpeed} [windspeed]
 *
 * @typedef {Object} Hourly
 * @property {Temperature} apparentTemp
 * @property {number} cloudCover
 * @property {Condition} condition
 * @property {string} description
 * @property {Temperature} dewPoint
 * @property {number} humidity
 * @property {number} precipProbability
 * @property {Volume} precipVolume
 * @property {Pressure} pressure
 * @property {Volume} rainVolume
 * @property {Volume} snowVolume
 * @property {number} sunshineDuration
 * @property {Temperature} temp
 * @property {number} time
 * @property {number} uvIndex
 * @property {Visibility} visibility
 * @property {WindSpeed} [windGust]
 * @property {WindSpeed} windspeed
 *
 * @typedef {Object} Weather
 * @property {string} [source]
 * @property {Current} current
 * @property {Daily[]} daily
 * @property {Hourly[]} hourly
 */

export {};
