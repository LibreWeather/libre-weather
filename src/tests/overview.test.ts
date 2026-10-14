import { Condition, TempUnit, type Hourly } from '@/models/weather';
import { conditionClass, mostSevere } from '@/utilities/conditions';
import { groupByStride, overviewBarLabel, overviewHours, upcomingHours } from '@/utilities/overview';
import { HOUR } from '@/utilities/time';

const hour = (time: number, condition = Condition.CLEAR) =>
  ({ time, condition, temp: { value: 70, unit: TempUnit.F } }) as Hourly;

describe('conditions', () => {
  test('the most severe condition wins, first on ties', () => {
    const items = [{ condition: Condition.CLOUDY, id: 1 }, { condition: Condition.RAIN, id: 2 }, {
      condition: Condition.RAIN,
      id: 3,
    }];
    expect(mostSevere(items).id).toBe(2);
  });

  test('wet conditions share a colour', () => {
    expect(conditionClass(Condition.SNOW)).toBe('bg-rain');
    expect(conditionClass(Condition.FOG)).toBe('bg-mostly-cloudy');
  });
});

describe('overview', () => {
  test('starts at the current hour', () => {
    const now = 10 * HOUR + 30 * 60 * 1000;
    const hours = [hour(9 * HOUR), hour(10 * HOUR), hour(11 * HOUR)];
    expect(upcomingHours(hours, now).map((h) => h.time)).toEqual([10 * HOUR, 11 * HOUR]);
    expect(upcomingHours(hours, 100 * HOUR)).toHaveLength(3);
  });

  test('formats temperatures for display', () => {
    expect(overviewHours([hour(0)], 0)).toEqual([{ condition: Condition.CLEAR, temp: '70˚', time: 0 }]);
  });

  test('merges neighbouring chunks with the same peak condition', () => {
    const hours = [Condition.CLEAR, Condition.CLEAR, Condition.CLEAR, Condition.RAIN, Condition.CLEAR, Condition.CLEAR]
      .map((condition, i) => ({ condition, time: i * HOUR, temp: '' }));
    expect(groupByStride(hours, 2).map(({ condition, hrCnt }) => [condition, hrCnt])).toEqual([
      [Condition.CLEAR, 2],
      [Condition.RAIN, 2],
      [Condition.CLEAR, 2],
    ]);
  });

  test('labels only bars wide enough to fit them', () => {
    expect(overviewBarLabel({ condition: Condition.RAIN, hrCnt: 3 }, false)).toBe('Rain');
    expect(overviewBarLabel({ condition: Condition.CLOUDY, hrCnt: 4 }, false)).toBe('');
    expect(overviewBarLabel({ condition: Condition.RAIN, hrCnt: 12 }, true)).toBe('');
  });
});
