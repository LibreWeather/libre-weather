import React from 'react';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';
import useDialogParam from '@/hooks/useDialogParam';
import type { WeatherAlert } from '@/models/alerts';
import { useAlerts } from '@/providers/AlertsProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { alertTime, sourceName, startsLater, untilLabel } from '@/utilities/alerts';
import AlertDialog from './AlertDialog';

import './WeatherAlerts.less';

const AlertItem = ({ alert, onOpen }: { alert: WeatherAlert; onOpen: (id: string) => void }) => {
  const until = untilLabel(alert);
  const onset = startsLater(alert);
  return (
    <details className={`weatherAlert severity-${alert.severity.toLowerCase()}`}>
      <summary className="weatherAlert-summary">
        <Icon icon={faTriangleExclamation} className="weatherAlert-icon" />
        <span className="weatherAlert-event">{alert.event}</span>
        {until ? <span className="weatherAlert-until">{until}</span> : null}
        <button
          type="button"
          className="weatherAlert-more is-compact"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpen(alert.id);
          }}>
          View full alert
        </button>
      </summary>
      <div className="weatherAlert-body">
        <p className="weatherAlert-headline">{alert.headline}</p>
        {onset ? <p className="weatherAlert-meta">Starts {alertTime(onset)}</p> : null}
        {alert.description ? <p className="weatherAlert-text">{alert.description}</p> : null}
        {alert.instruction ? (
          <>
            <h3 className="weatherAlert-subhead">What to do</h3>
            <p className="weatherAlert-text">{alert.instruction}</p>
          </>
        ) : null}
        {alert.areas ? <p className="weatherAlert-meta">Areas: {alert.areas}</p> : null}
        <p className="weatherAlert-meta">
          Issued by {alert.sender} · {sourceName(alert.source)}
        </p>
        <button type="button" className="weatherAlert-more" onClick={() => onOpen(alert.id)}>
          View full alert
        </button>
      </div>
    </details>
  );
};

const AlertChip = ({ alert, onOpen }: { alert: WeatherAlert; onOpen: (id: string) => void }) => {
  const until = untilLabel(alert);
  return (
    <button
      type="button"
      className={`weatherAlertChip severity-${alert.severity.toLowerCase()}`}
      title={until ? `${alert.event} ${until}` : alert.event}
      aria-label={`${alert.event}${until ? `, ${until}` : ''}. View full alert`}
      onClick={() => onOpen(alert.id)}>
      <Icon icon={faTriangleExclamation} className="weatherAlert-icon" />
      <span className="weatherAlertChip-event">{alert.event}</span>
    </button>
  );
};

const WeatherAlerts = () => {
  const { alerts, status } = useAlerts();
  const { resolved } = usePreferences();
  const { value: openId, open, close } = useDialogParam('alert');
  const settled = status === 'ready' || status === 'error';
  const openAlert = openId ? alerts.find((alert) => alert.id === openId) ?? null : null;

  const dialog =
    openId && (openAlert || settled) ? <AlertDialog alert={openAlert} onClose={close} key={openId} /> : null;

  if (!alerts.length) return dialog;

  return (
    <>
      <section
        className={`weatherAlerts forecast-col${resolved.compact ? ' is-compact' : ''}`}
        aria-label={`${alerts.length} active weather alert${alerts.length > 1 ? 's' : ''}`}>
        {alerts.map((alert) =>
          resolved.compact ? (
            <AlertChip alert={alert} key={alert.id} onOpen={open} />
          ) : (
            <AlertItem alert={alert} key={alert.id} onOpen={open} />
          )
        )}
      </section>
      {dialog}
    </>
  );
};

export const AlertsCoverageNote = () => {
  const { coverage } = useAlerts();
  if (coverage !== false) return null;
  return <p className="alertsCoverageNote forecast-col">Weather alerts aren&apos;t available for this area yet.</p>;
};

export default WeatherAlerts;
