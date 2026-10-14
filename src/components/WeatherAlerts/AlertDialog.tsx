import React from 'react';
import { faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';

import { useModalDialog } from '@/hooks/useModalDialog';
import type { WeatherAlert } from '@/models/alerts';
import { alertFacts, severityClass, sourceName } from '@/utilities/alerts';
import './WeatherAlerts.scss';

type AlertDialogProps = {
  /** `null` once the alert is no longer in the active list, e.g. a stale shared link. */
  alert: WeatherAlert | null;
  onClose: () => void;
};

const subhead = 'mb-[0.4rem] font-sans text-[0.95rem] font-[650] tracking-normal';
const text = 'leading-normal whitespace-pre-line text-white/88';

const AlertDialog = ({ alert, onClose }: AlertDialogProps) => {
  const { ref, close, onBackdropClick } = useModalDialog();
  const titleId = React.useId();
  const facts = alert ? alertFacts(alert) : [];

  return (
    <dialog
      ref={ref}
      className={
        `alertDialog ${severityClass(alert?.severity)} m-auto max-h-[calc(100dvh_-_4rem)] ` +
        'w-[min(40rem,calc(100vw_-_2rem))] ' +
        'rounded-2xl border border-(--alert-color)/45 bg-panel p-0 text-left text-base text-white ' +
        'shadow-[0_1.5rem_4rem_rgb(0_0_0/0.55)] backdrop:bg-[rgb(10_12_15/0.6)] backdrop:backdrop-blur-[3px] ' +
        'max-md:mx-0 max-md:mt-auto max-md:mb-0 max-md:max-h-[88dvh] max-md:w-screen max-md:max-w-[100vw] ' +
        'max-md:rounded-t-2xl max-md:rounded-b-none max-md:border-x-0 max-md:border-b-0'
      }
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={onBackdropClick}>
      <div className="flex max-h-[inherit] flex-col">
        <header
          className={
            'flex items-center gap-[0.65rem] border-b border-(--alert-color)/30 bg-(--alert-color)/16 ' +
            'py-[0.9rem] pr-4 pl-5'
          }>
          <Icon icon={faTriangleExclamation} className="text-[1.15rem] text-(--alert-color)" />
          <h2 className="flex-1 font-sans text-[1.2rem] font-bold tracking-normal" id={titleId}>
            {alert ? alert.event : 'Alert no longer active'}
          </h2>
          <button
            type="button"
            className={
              'alertDialog-close grid size-9 place-items-center rounded-lg text-[1.1rem] text-white/75 ' +
              'hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-(--alert-color)'
            }
            aria-label="Close"
            onClick={close}>
            <Icon icon={faXmark} />
          </button>
        </header>

        <div
          className="overflow-y-auto overscroll-contain px-5 pt-4 pb-5 max-md:pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {alert ? (
            <>
              <p className="mb-4 leading-[1.4] font-[550]">{alert.headline}</p>
              <dl
                className={
                  'mb-5 grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-x-4 gap-y-3 rounded-xl bg-white/4 ' +
                  'px-4 py-[0.85rem]'
                }>
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-semibold tracking-[0.04em] text-white/50 uppercase">{label}</dt>
                    <dd className="mt-[0.1rem] text-[0.92rem]">{value}</dd>
                  </div>
                ))}
              </dl>
              {alert.description ? (
                <section className="mt-[1.1rem]">
                  <h3 className={subhead}>Details</h3>
                  <p className={text}>{alert.description}</p>
                </section>
              ) : null}
              {alert.instruction ? (
                <section className="alertDialog-instruction mt-[1.1rem] border-l-[3px] border-(--alert-color) py-[0.1rem] pl-[0.9rem]">
                  <h3 className={subhead}>What to do</h3>
                  <p className={text}>{alert.instruction}</p>
                </section>
              ) : null}
              {alert.areas ? (
                <section className="mt-[1.1rem]">
                  <h3 className={subhead}>Areas</h3>
                  <p className={text}>{alert.areas}</p>
                </section>
              ) : null}
              {alert.url ? (
                <a
                  className="mt-5 inline-block text-[0.9rem] text-white/75 underline hover:text-white"
                  href={alert.url}
                  target="_blank"
                  rel="noreferrer">
                  View on {sourceName(alert.source)}
                </a>
              ) : null}
            </>
          ) : (
            <p className={text}>This alert has expired or been cancelled for this location.</p>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default AlertDialog;
