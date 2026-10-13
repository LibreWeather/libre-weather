import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';

import { SOURCE_NAMES, type WeatherAlert } from '@/utilities/alertTypes';

const formatDateTime = (ms: number) =>
  new Date(ms).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const titleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

type AlertDialogProps = {
  /** `null` once the alert is no longer in the active list, e.g. a stale shared link. */
  alert: WeatherAlert | null;
  onClose: () => void;
};

const AlertDialog = ({ alert, onClose }: AlertDialogProps) => {
  const dialog = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    const node = dialog.current;
    if (node && !node.open) node.showModal();
  }, []);

  const close = () => dialog.current?.close();

  const facts: [string, string][] = alert ?
      [
        ['Starts', alert.onset ? formatDateTime(alert.onset) : null],
        ['Ends', (alert.ends ?? alert.expires) ? formatDateTime((alert.ends ?? alert.expires)!) : null],
        ['Message expires', alert.ends && alert.expires && alert.expires !== alert.ends ? formatDateTime(alert.expires) : null],
        ['Severity', titleCase(alert.severity)],
        ['Urgency', alert.urgency],
        ['Certainty', alert.certainty],
        ['Issued by', alert.sender],
        ['Source', SOURCE_NAMES[alert.source] ?? alert.source],
      ].filter((fact): fact is [string, string] => Boolean(fact[1])) :
      [];

  return (
    <dialog
      ref={dialog}
      className={`alertDialog severity-${(alert?.severity ?? 'unknown').toLowerCase()}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}>
      <div className="alertDialog-panel">
        <header className="alertDialog-header">
          <FontAwesomeIcon icon={faTriangleExclamation} className="alertDialog-icon" />
          <h2 className="alertDialog-title" id={titleId}>
            {alert ? alert.event : 'Alert no longer active'}
          </h2>
          <button type="button" className="alertDialog-close" aria-label="Close" onClick={close}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </header>

        {alert ? (
          <div className="alertDialog-body">
            <p className="alertDialog-headline">{alert.headline}</p>
            <dl className="alertDialog-facts">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {alert.description ? (
              <section>
                <h3 className="alertDialog-subhead">Details</h3>
                <p className="alertDialog-text">{alert.description}</p>
              </section>
            ) : null}
            {alert.instruction ? (
              <section className="alertDialog-instruction">
                <h3 className="alertDialog-subhead">What to do</h3>
                <p className="alertDialog-text">{alert.instruction}</p>
              </section>
            ) : null}
            {alert.areas ? (
              <section>
                <h3 className="alertDialog-subhead">Areas</h3>
                <p className="alertDialog-text">{alert.areas}</p>
              </section>
            ) : null}
            {alert.url ? (
              <a className="alertDialog-source" href={alert.url} target="_blank" rel="noreferrer">
                View on {SOURCE_NAMES[alert.source] ?? alert.source}
              </a>
            ) : null}
          </div>
        ) : (
          <div className="alertDialog-body">
            <p className="alertDialog-text">This alert has expired or been cancelled for this location.</p>
          </div>
        )}
      </div>
    </dialog>
  );
};

export default AlertDialog;
