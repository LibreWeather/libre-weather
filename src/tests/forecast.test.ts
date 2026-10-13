import { TempUnit, VolumeUnit, type Hourly } from '@/models/weather';
import type { ForecastDay } from '@/models/forecast';
import { hoursOnDay, precipitation, rangePercent, tempBounds } from '@/utilities/forecast';

const volume = (value: number | null) => ({ value, unit: VolumeUnit.MM });

describe('forecast', () => {
  test('precipitation picks the larger of rain and snow without changing either', () => {
    const rain = volume(null);
    const snow = volume(null);
    expect(precipitation(rain, snow)).toEqual({ type: 'Rain', value: '0 mm' });
    expect(rain.value).toBeNull();
    expect(precipitation(volume(1), volume(3))).toEqual({ type: 'Snow', value: '3 mm' });
    expect(precipitation(volume(2), volume(1))).toEqual({ type: 'Rain', value: '2 mm' });
  });

  test('hours are matched to their local calendar day', () => {
    const day = new Date(2026, 9, 13, 0, 0).getTime();
    const hourly = [new Date(2026, 9, 12, 23).getTime(), new Date(2026, 9, 13, 1).getTime()].map(
      (time) => ({ time }) as Hourly
    );
    expect(hoursOnDay(hourly, day).map((h) => h.time)).toEqual([hourly[1].time]);
  });

  test('temperature bounds and positions share one scale', () => {
    const temp = (value: number) => ({ value, unit: TempUnit.F });
    const days = [
      { minTemp: temp(40), maxTemp: temp(60) },
      { minTemp: temp(30), maxTemp: temp(70) },
    ] as ForecastDay[];
    expect(tempBounds(days)).toEqual({ min: 30, max: 70 });
    expect(rangePercent(50, 30, 70)).toBe(50);
    expect(rangePercent(5, 5, 5)).toBe(50);
  });
});
