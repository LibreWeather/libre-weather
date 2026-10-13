import { formatClock } from './locale';
import { TempUnit, type Temperature, type Volume, VolumeUnit } from './weatherTypes';

export const tempDisplay = (temp: Temperature) =>
  `${Math.round(Number(temp.value))}${temp.unit === TempUnit.K ? 'K' : '˚'}`;

export const timeDisplay = (time: number) => formatClock(time);

export const volumeDisplay = (volume: Volume) => `${volume.value} ${volume.unit === VolumeUnit.IN ? 'in' : 'mm'}`;

export const getDayOfTheWeek = (time: number) => {
  switch (new Date(time).getDay()) {
    case 0:
      return 'Sun';
    case 1:
      return 'Mon';
    case 2:
      return 'Tue';
    case 3:
      return 'Wed';
    case 4:
      return 'Thu';
    case 5:
      return 'Fri';
    default:
      return 'Sat';
  }
};
