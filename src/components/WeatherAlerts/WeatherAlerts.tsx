import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { useAlerts } from '../../providers/AlertsProvider';
import { SOURCE_NAMES, type WeatherAlert } from '@/utilities/alertTypes';
import { formatDateTime } from '@/utilities/locale';
import AlertDialog from './AlertDialog';

import './WeatherAlerts.less';

const formatTime = (ms: number) => formatDateTime(ms, { weekday: 'short', hour: 'numeric', minute: '2-digit' });

const untilLabel = (alert: WeatherAlert) => {
  const end = alert.ends ?? alert.expires;
  return end ? `until ${formatTime(end)}` : null;
};

const AlertItem = ({ alert, onOpen }: { alert: WeatherAlert; onOpen: (id: string) => void }) => {
  const until = untilLabel(alert);
  const startsLater = alert.onset && alert.onset > Date.now();
  return (
    <details className={`weatherAlert severity-${alert.severity.toLowerCase()}`}>
      <summary className="weatherAlert-summary">
        <FontAwesomeIcon icon={faTriangleExclamation} className="weatherAlert-icon" />
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
        </p>
        <button type="button" className="weatherAlert-more" onClick={() => onOpen(alert.id)}>
          View full alert
        </button>
      </div>
    </details>
  );
};

const ALERT_PARAM = 'alert';

const WeatherAlerts = () => {
  const { alerts, status } = useAlerts();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const openId = params.get(ALERT_PARAM);
  const settled = status === 'ready' || status === 'error';
  const openAlert = openId ? alerts.find((alert) => alert.id === openId) ?? null : null;

  const open = (id: string) => {
    const next = new URLSearchParams(params);
    next.set(ALERT_PARAM, id);
    setParams(next, { state: { alertOpenedInApp: true } });
  };

  const close = () => {
    if ((location.state as { alertOpenedInApp?: boolean } | null)?.alertOpenedInApp) {
      navigate(-1);
      return;
    }
    const next = new URLSearchParams(params);
    next.delete(ALERT_PARAM);
    setParams(next, { replace: true });
  };

  const dialog =
    openId && (openAlert || settled) ? <AlertDialog alert={openAlert} onClose={close} key={openId} /> : null;

  if (!alerts.length) return dialog;

  return (
    <>
      <section
        className="weatherAlerts forecast-col"
        aria-label={`${alerts.length} active weather alert${alerts.length > 1 ? 's' : ''}`}>
        {alerts.map((alert) => (
          <AlertItem alert={alert} key={alert.id} onOpen={open} />
        ))}
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
