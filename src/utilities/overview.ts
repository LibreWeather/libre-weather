import type { OverviewBar, OverviewHour } from '@/models/forecast';
import { Condition, type Hourly } from '@/models/weather';
import { conditionName, mostSevere } from './conditions';
import { tempDisplay } from './formatters';
import { formatHour } from './locale';
import { HOUR } from './time';

export const OVERVIEW_HOURS = 24;

/** Hours from the current one onward; all of them if the data is entirely in the past. */
export const upcomingHours = (hourly: Hourly[] | undefined, now = Date.now()) => {
  const hours = (hourly ?? []).filter(Boolean);
  const ahead = hours.filter((hour) => hour.time + HOUR > now);
  return ahead.length ? ahead : hours;
};

export const overviewHours = (hourly: Hourly[] | undefined, now = Date.now()): OverviewHour[] =>
  upcomingHours(hourly, now).map(({ condition, temp, time }) => ({ condition, temp: tempDisplay(temp), time }));

/**
 * Collapse the next 24 hours into bars: each `stride`-hour chunk takes its most severe condition,
 * and neighbouring chunks with the same condition merge.
 */
export const groupByStride = (hours: OverviewHour[], stride: number): OverviewBar[] => {
  const bars: OverviewBar[] = [];
  for (let i = 0; i < OVERVIEW_HOURS && i < hours.length; i += stride) {
    const chunk = hours.slice(i, Math.min(i + stride, OVERVIEW_HOURS));
    if (!chunk.length) break;
    const peak = mostSevere(chunk);
    const last = bars[bars.length - 1];
    if (last && last.condition === peak.condition) {
      last.hrCnt += chunk.length;
      last.endTime = chunk[chunk.length - 1].time;
    } else {
      bars.push({
        hrCnt: chunk.length,
        condition: peak.condition,
        time: peak.time,
        startTime: chunk[0].time,
        endTime: chunk[chunk.length - 1].time,
      });
    }
  }
  return bars;
};

/** Text inside a bar, or empty when the bar is too narrow to fit it. */
export const overviewBarLabel = ({ condition, hrCnt }: Pick<OverviewBar, 'condition' | 'hrCnt'>, narrow: boolean) => {
  if (narrow) return '';
  const cloudy = condition === Condition.PARTLY_CLOUDY || condition === Condition.CLOUDY;
  return hrCnt < (cloudy ? 5 : 3) ? '' : conditionName(condition);
};

export const overviewBarTip = ({ condition, startTime, endTime }: OverviewBar) =>
  `${conditionName(condition)} · ${formatHour(startTime)}–${formatHour(endTime)}`;
