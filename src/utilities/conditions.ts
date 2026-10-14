import { Condition } from '@/models/weather';

/** Higher = more precipitous. Used when a collapsed stretch covers mixed conditions. */
const CONDITION_RANK: Record<Condition, number> = {
  [Condition.CLEAR]: 0,
  [Condition.PARTLY_CLOUDY]: 1,
  [Condition.CLOUDY]: 2,
  [Condition.FOG]: 3,
  [Condition.WIND]: 3,
  [Condition.RAIN]: 4,
  [Condition.SNOW]: 5,
  [Condition.SLEET]: 6,
};

export const conditionName = (condition: Condition) => {
  switch (condition) {
    case Condition.RAIN:
      return 'Rain';
    case Condition.SNOW:
      return 'Snow';
    case Condition.SLEET:
      return 'Sleet';
    case Condition.PARTLY_CLOUDY:
      return 'Partly Cloudy';
    case Condition.CLOUDY:
      return 'Mostly Cloudy';
    case Condition.FOG:
      return 'Foggy';
    default:
      return 'Clear';
  }
};

/** Tailwind class picking the background colour for a condition. */
export const conditionClass = (condition: Condition) => {
  switch (condition) {
    case Condition.RAIN:
    case Condition.SNOW:
    case Condition.SLEET:
      return 'bg-rain';
    case Condition.PARTLY_CLOUDY:
      return 'bg-partly-cloudy';
    case Condition.CLOUDY:
    case Condition.FOG:
      return 'bg-mostly-cloudy';
    default:
      return 'bg-clear';
  }
};

/** The entry with the most severe condition; the first one wins ties. */
export const mostSevere = <T extends { condition: Condition }>(items: T[]) =>
  items.reduce((best, item) =>
    (CONDITION_RANK[item.condition] ?? 0) > (CONDITION_RANK[best.condition] ?? 0) ? item : best
  );
