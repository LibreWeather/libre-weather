import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';

import { useModalDialog } from '@/hooks/useModalDialog';
import type { WeatherAlert } from '@/models/alerts';
import { alertFacts, sourceName } from '@/utilities/alerts';

type AlertDialogProps = {
  /** `null` once the alert is no longer in the active list, e.g. a stale shared link. */
  alert: WeatherAlert | null;
  onClose: () => void;
};

const AlertDialog = ({ alert, onClose }: AlertDialogProps) => {
  const { ref, close, onBackdropClick } = useModalDialog();
  const titleId = React.useId();
  const facts = alert ? alertFacts(alert) : [];

  return (
    <dialog
      ref={ref}
      className={`alertDialog severity-${(alert?.severity ?? 'unknown').toLowerCase()}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={onBackdropClick}>
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
                View on {sourceName(alert.source)}
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
