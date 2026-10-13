import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

import { useAlerts } from '../../providers/AlertsProvider';
import { SOURCE_NAMES, type WeatherAlert } from '@/utilities/alertTypes';

import './WeatherAlerts.less';

const formatTime = (ms: number) =>
  new Date(ms).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

const untilLabel = (alert: WeatherAlert) => {
  const end = alert.ends ?? alert.expires;
  return end ? `until ${formatTime(end)}` : null;
};

const AlertItem = ({ alert }: { alert: WeatherAlert }) => {
  const until = untilLabel(alert);
  const startsLater = alert.onset && alert.onset > Date.now();
  return (
    <details className={`weatherAlert severity-${alert.severity.toLowerCase()}`}>
      <summary className="weatherAlert-summary">
        <FontAwesomeIcon icon={faTriangleExclamation} className="weatherAlert-icon" />
        <span className="weatherAlert-event">{alert.event}</span>
        {until ? <span className="weatherAlert-until">{until}</span> : null}
      </summary>
      <div className="weatherAlert-body">
        <p className="weatherAlert-headline">{alert.headline}</p>
        {startsLater ? <p className="weatherAlert-meta">Starts {formatTime(alert.onset!)}</p> : null}
        {alert.description ? <p className="weatherAlert-text">{alert.description}</p> : null}
        {alert.instruction ? (
          <>
            <h3 className="weatherAlert-subhead">What to do</h3>
            <p className="weatherAlert-text">{alert.instruction}</p>
          </>
        ) : null}
        {alert.areas ? <p className="weatherAlert-meta">Areas: {alert.areas}</p> : null}
        <p className="weatherAlert-meta">
          Issued by {alert.sender} · {SOURCE_NAMES[alert.source] ?? alert.source}
          {alert.url ? (
            <>
              {' · '}
              <a href={alert.url} target="_blank" rel="noreferrer">
                Full alert
              </a>
            </>
          ) : null}
        </p>
      </div>
    </details>
  );
};

const WeatherAlerts = () => {
  const { alerts } = useAlerts();
  if (!alerts.length) return null;

  return (
    <section className="weatherAlerts forecast-col" aria-label={`${alerts.length} active weather alert${alerts.length > 1 ? 's' : ''}`}>
      {alerts.map((alert) => (
        <AlertItem alert={alert} key={alert.id} />
      ))}
    </section>
  );
};

export const AlertsCoverageNote = () => {
  const { coverage } = useAlerts();
  if (coverage !== false) return null;
  return <p className="alertsCoverageNote forecast-col">Weather alerts aren&apos;t available for this area yet.</p>;
};

export default WeatherAlerts;
