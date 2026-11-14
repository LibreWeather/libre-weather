import {
  PressureUnit,
  TempUnit,
  UnitSystem,
  VisibilityUnit,
  VolumeUnit,
  WindUnit,
  type Pressure,
  type Temperature,
  type TempRange,
  type Visibility,
  type Volume,
  type WindSpeed,
} from '@/models/weather';

export const imperial = (units: UnitSystem) => units === UnitSystem.IMPERIAL;

export const num = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : 0;
};

/** Pirate Weather reports humidity, cloud cover, and precip chance as fractions. */
export const percent = (fraction: unknown) => {
  const n = Number(fraction);
  return Number.isFinite(n) ? n * 100 : 0;
};

export const temperature = (value: unknown, units: UnitSystem): Temperature => ({
  value: num(value),
  unit: imperial(units) ? TempUnit.F : TempUnit.C,
});

export const tempRange = (min: unknown, max: unknown, units: UnitSystem): TempRange => ({
  min: temperature(min, units),
  max: temperature(max, units),
});

export const pressureOf = (value: unknown): Pressure => {
  const n = Number(value);
  return { value: Number.isFinite(n) ? n : null, unit: PressureUnit.MB };
};

export const amount = (value: unknown, units: UnitSystem): Volume => {
  const n = Number(value);
  return {
    value: value == null || value === '' || !Number.isFinite(n) ? null : n,
    unit: imperial(units) ? VolumeUnit.IN : VolumeUnit.MM,
  };
};

/**
 * Pirate Weather accumulation is inches (`us`) or centimetres (`si`).
 * Intensity is inches per hour or millimetres per hour.
 */
export const depth = (value: unknown, units: UnitSystem, from: 'cm-or-in' | 'mm-or-in'): Volume => {
  const measured = amount(value, units);
  if (measured.value == null || imperial(units) || from === 'mm-or-in') return measured;
  return { value: Number(measured.value) * 10, unit: VolumeUnit.MM };
};

export const wind = (magnitude: unknown, direction: unknown, units: UnitSystem): WindSpeed => ({
  magnitude: num(magnitude),
  direction: num(direction),
  unit: imperial(units) ? WindUnit.MPH : WindUnit.MS,
});

export const windOrNull = (magnitude: unknown, direction: unknown, units: UnitSystem) =>
  magnitude == null || magnitude === '' ? null : wind(magnitude, direction, units);

export const emptyVisibility = (units: UnitSystem): Visibility => ({
  value: null,
  unit: imperial(units) ? VisibilityUnit.MI : VisibilityUnit.M,
});

/** Open-Meteo visibility is metres. */
export const visibilityFromMeters = (meters: unknown, units: UnitSystem): Visibility => {
  const n = Number(meters);
  if (!Number.isFinite(n)) return emptyVisibility(units);
  if (imperial(units)) return { value: Math.round((n / 1609.344) * 100) / 100, unit: VisibilityUnit.MI };
  return { value: n, unit: VisibilityUnit.M };
};

/** Pirate Weather visibility is miles (`us`) or kilometres (`si`). */
export const visibilityFromPirate = (value: unknown, units: UnitSystem): Visibility => {
  const n = Number(value);
  if (!Number.isFinite(n)) return emptyVisibility(units);
  if (imperial(units)) return { value: n, unit: VisibilityUnit.MI };
  return { value: n * 1000, unit: VisibilityUnit.M };
};

/**
 * Open-Meteo local timestamps have no offset. The request asks for the browser zone,
 * so a zoneless string is already local. Date-only values are local midnight, not UTC.
 */
export const localMillis = (value: unknown) => {
  if (typeof value !== 'string' || value === '') return 0;
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const time = new Date(iso).getTime();
  return Number.isFinite(time) ? time : 0;
};

/** Pirate Weather times are UNIX seconds. */
export const unixMillis = (seconds: unknown) => {
  const n = Number(seconds);
  return Number.isFinite(n) ? n * 1000 : 0;
};

export const asRecord = (body: unknown, label: string): Record<string, unknown> => {
  if (!body || typeof body !== 'object') throw new Error(`Unexpected ${label} payload`);
  const record = body as Record<string, unknown>;
  if (record.error === true || (typeof record.error === 'string' && record.error !== '')) {
    throw new Error(typeof record.reason === 'string' ? record.reason : String(record.error));
  }
  return record;
};

export const block = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const list = (source: Record<string, unknown>, key: string): unknown[] =>
  Array.isArray(source[key]) ? source[key] : [];
