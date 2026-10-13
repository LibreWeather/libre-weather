import { formatClock } from './locale';
import {
  TempUnit,
  VisibilityUnit,
  VolumeUnit,
  WindUnit,
  type Pressure,
  type Temperature,
  type Visibility,
  type Volume,
  type WindSpeed,
} from '@/models/weather';

/** Shown in place of a value the API didn't send. */
export const MISSING = '—';

export const tempSuffix = (unit?: TempUnit) => (unit === TempUnit.K ? 'K' : '˚');

export const tempDisplay = (temp?: Temperature) =>
  temp ? `${Math.round(Number(temp.value))}${tempSuffix(temp.unit)}` : MISSING;

/** Rounds to `digits` places, or shows {@link MISSING} for null and non-finite values. */
export const numberDisplay = (value: number | null | undefined, digits = 0) => {
  if (value == null || !Number.isFinite(value)) return MISSING;
  const factor = 10 ** digits;
  return `${Math.round(value * factor) / factor}`;
};

export const timeDisplay = (time: number) => formatClock(time);

export const volumeLabel = (unit?: VolumeUnit) => (unit === VolumeUnit.IN ? 'in' : 'mm');

export const volumeDisplay = (volume?: Volume) => `${volume?.value ?? 0} ${volumeLabel(volume?.unit)}`;

export const windLabel = (unit?: WindUnit) => {
  if (unit === WindUnit.MPH) return 'mph';
  if (unit === WindUnit.KMH) return 'km/h';
  return 'm/s';
};

export const windDisplay = (wind?: WindSpeed | null) => {
  if (!wind || wind.magnitude == null || wind.magnitude === '') return MISSING;
  return `${Math.round(Number.parseFloat(String(wind.magnitude)) || 0)} ${windLabel(wind.unit)}`;
};

export const pressureDisplay = (pressure: Pressure) => `${Math.round(Number(pressure.value))} mb`;

/** Label for a visibility value in the units the API sent it in. */
export const visibilityLabel = (unit?: VisibilityUnit) => {
  if (unit === VisibilityUnit.MI) return 'mi';
  if (unit === VisibilityUnit.Percent) return '%';
  return 'm';
};

/** Distances read as miles or kilometres, capped at "10+" where the exact figure stops mattering. */
export const visibilityDisplay = (visibility: Visibility) => {
  const value = Number(visibility.value);
  if (visibility.unit === VisibilityUnit.Percent) return `${Math.round(value)} %`;
  const [distance, label] = visibility.unit === VisibilityUnit.MI ? [value, 'mi'] : [value / 1000, 'km'];
  return distance >= 10 ? `10+ ${label}` : `${Math.round(distance)} ${label}`;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const getDayOfTheWeek = (time: number) => WEEKDAYS[new Date(time).getDay()];
