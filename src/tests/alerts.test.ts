import type { WeatherAlert } from '@/models/alerts';
import { activeAlerts, alertFacts, sourceName, startsLater } from '@/utilities/alerts';

const alert = (overrides: Partial<WeatherAlert> = {}) =>
  ({
    id: 'a',
    source: 'NWS',
    event: 'Flood Warning',
    severity: 'SEVERE',
    sender: 'NWS Kansas City',
    onset: null,
    expires: null,
    ends: null,
    urgency: null,
    certainty: null,
    ...overrides,
  }) as WeatherAlert;

describe('alerts', () => {
  test('expired messages are dropped', () => {
    const alerts = [alert({ id: 'old', expires: 5 }), alert({ id: 'new', expires: 50 }), alert({ id: 'open' })];
    expect(activeAlerts(alerts, 10).map((a) => a.id)).toEqual(['new', 'open']);
  });

  test('only future onsets count as starting later', () => {
    expect(startsLater(alert({ onset: 20 }), 10)).toBe(20);
    expect(startsLater(alert({ onset: 5 }), 10)).toBeNull();
  });

  test('facts skip missing fields and name the source', () => {
    const facts = alertFacts(alert({ urgency: 'Immediate' }));
    expect(facts).toEqual([
      ['Severity', 'Severe'],
      ['Urgency', 'Immediate'],
      ['Issued by', 'NWS Kansas City'],
      ['Source', 'National Weather Service'],
    ]);
    expect(sourceName('XYZ' as never)).toBe('XYZ');
  });
});
