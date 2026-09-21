export enum Condition {
  RAIN = 'RAIN',
  SNOW = 'SNOW',
  SLEET = 'SLEET',
  FOG = 'FOG',
  WIND = 'WIND',
  CLEAR = 'CLEAR',
  PARTLY_CLOUDY = 'PARTLY_CLOUDY',
  CLOUDY = 'CLOUDY'
}

export enum UnitSystem {
  IMPERIAL = 'IMPERIAL',
  METRIC = 'METRIC',
  FREEDOM_UNITS = 'IMPERIAL',
  DEFAULT = 'DEFAULT'
}

export enum TempUnit {
  K = 'K',
  C = 'C',
  F = 'F'
}

export enum PressureUnit {
  MB = 'MB'
}

export enum VolumeUnit {
  MM = 'MM',
  IN = 'IN'
}

export enum VisibilityUnit {
  M = 'M',
  MI = 'MI',
  Percent = '%'
}

export enum WindUnit {
  MS = 'MS',
  MPH = 'MPH'
}

export type Temperature = {
  value: number | string;
  unit: TempUnit;
};

export type Pressure = {
  value: number | string | null;
  unit: PressureUnit;
};

export type Volume = {
  value: number | string | null;
  unit: VolumeUnit;
};

export type Visibility = {
  value: number | string | null;
  unit: VisibilityUnit;
};

export type WindSpeed = {
  magnitude: number | string;
  direction: number | string;
  unit: WindUnit;
};

export type TempRange = {
  min: Temperature;
  max: Temperature;
};

export type Current = {
  apparentTemp: Temperature;
  condition: Condition;
  description?: string;
  dewPoint: Temperature;
  humidity: number;
  pressure: Pressure;
  summary?: string;
  sunrise: number;
  sunset: number;
  temp: Temperature;
  time: number;
  uvIndex?: number;
  visibility: Visibility;
  windspeed: WindSpeed;
};

export type Daily = {
  apparentTemp?: TempRange;
  cloudCover?: number;
  condition: Condition;
  daylightDuration?: number;
  description: string;
  dewPoint?: Temperature;
  humidity?: number;
  precipHours?: number;
  precipProbability?: number;
  pressure?: Pressure;
  rainVolume: Volume;
  snowVolume: Volume;
  sunrise: number;
  sunshineDuration?: number;
  sunset: number;
  temp: TempRange;
  time: number;
  uvIndex?: number;
  windGust?: WindSpeed;
  windspeed?: WindSpeed;
};

export type Hourly = {
  apparentTemp: Temperature;
  cloudCover: number;
  condition: Condition;
  description: string;
  dewPoint: Temperature;
  humidity: number;
  precipProbability: number;
  precipVolume: Volume;
  pressure: Pressure;
  rainVolume: Volume;
  snowVolume: Volume;
  sunshineDuration: number;
  temp: Temperature;
  time: number;
  uvIndex: number;
  visibility: Visibility;
  windGust?: WindSpeed;
  windspeed: WindSpeed;
};

export type Weather = {
  source?: string;
  current: Current;
  daily: Daily[];
  hourly: Hourly[];
};
