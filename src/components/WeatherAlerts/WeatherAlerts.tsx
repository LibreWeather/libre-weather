import React from 'react';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import Icon from '@components/Icon';
import useDialogParam from '@/hooks/useDialogParam';
import type { WeatherAlert } from '@/models/alerts';
import { useAlerts } from '@/providers/AlertsProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { alertTime, severityClass, sourceName, startsLater, untilLabel } from '@/utilities/alerts';
import AlertDialog from './AlertDialog';
import './WeatherAlerts.scss';

const alertFocus = 'focus-visible:outline-2 focus-visible:outline-(--alert-color)';
const moreButton =
  'weatherAlert-more rounded-lg border border-(--alert-color)/55 bg-(--alert-color)/14 font-semibold ' +
  `hover:bg-(--alert-color)/24 focus-visible:outline-offset-2 ${alertFocus}`;
const subhead = 'mt-[0.9rem] mb-[0.35rem] font-sans text-[0.95rem] font-[650] tracking-normal';
const text = 'mb-2 leading-[1.45] whitespace-pre-line text-white/88';
const meta = 'mt-2 text-[0.85em] text-white/60';

const AlertItem = ({ alert, onOpen }: { alert: WeatherAlert; onOpen: (id: string) => void }) => {
  const until = untilLabel(alert);
  const onset = startsLater(alert);
  return (
    <details
      className={
        `weatherAlert ${severityClass(alert.severity)} group overflow-hidden rounded-xl border ` +
        'border-(--alert-color)/45'
      }>
      <summary
        className={
          'weatherAlert-summary flex cursor-pointer list-none flex-wrap items-baseline gap-x-[0.6rem] gap-y-1 ' +
          `px-3.5 py-[0.7rem] hover:bg-white/3 focus-visible:-outline-offset-2 ${alertFocus} ` +
          'max-md:px-3 max-md:py-[0.6rem] [&::-webkit-details-marker]:hidden ' +
          'after:ml-2 after:size-2 after:rotate-45 after:self-center after:border-r-2 after:border-b-2 ' +
          'after:border-current after:opacity-60 after:transition-transform group-open:after:ml-auto ' +
          'group-open:after:-rotate-135'
        }>
        <Icon icon={faTriangleExclamation} className="self-center text-(--alert-color)" />
        <span className="weatherAlert-event font-[650]">{alert.event}</span>
        {until ? <span className="text-[0.9em] text-white/70">{until}</span> : null}
        <button
          type="button"
          className={`${moreButton} is-compact ml-auto self-center px-[0.6rem] py-[0.2rem] text-[0.78em] group-open:hidden`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpen(alert.id);
          }}>
          View full alert
        </button>
      </summary>
      <div className="weatherAlert-body border-t border-white/6 px-3.5 pt-1 pb-[0.9rem] max-md:px-3 max-md:pb-3">
        <p className="my-[0.6rem] font-[550]">{alert.headline}</p>
        {onset ? <p className={meta}>Starts {alertTime(onset)}</p> : null}
        {alert.description ? <p className={text}>{alert.description}</p> : null}
        {alert.instruction ? (
          <>
            <h3 className={subhead}>What to do</h3>
            <p className={text}>{alert.instruction}</p>
          </>
        ) : null}
        {alert.areas ? <p className={meta}>Areas: {alert.areas}</p> : null}
        <p className={meta}>
          Issued by {alert.sender} · {sourceName(alert.source)}
        </p>
        <button
          type="button"
          className={`${moreButton} mt-3 px-[0.8rem] py-[0.4rem] text-[0.85em]`}
          onClick={() => onOpen(alert.id)}>
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
      className={
        `weatherAlertChip ${severityClass(alert.severity)} flex max-w-full min-w-0 flex-[1_1_10rem] items-center ` +
        'gap-[0.45rem] rounded-lg border border-(--alert-color)/45 px-[0.65rem] py-[0.35rem] text-left ' +
        `text-[0.8rem] font-semibold focus-visible:outline-offset-2 ${alertFocus}`
      }
      title={until ? `${alert.event} ${until}` : alert.event}
      aria-label={`${alert.event}${until ? `, ${until}` : ''}. View full alert`}
      onClick={() => onOpen(alert.id)}>
      <Icon icon={faTriangleExclamation} className="flex-none text-(--alert-color)" />
      <span className="min-w-0 truncate">{alert.event}</span>
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
        className={
          'weatherAlerts forecast-col flex text-left text-base ' +
          (resolved.compact ? 'is-compact mt-2 mb-3 flex-row flex-wrap gap-[0.4rem]' : 'mt-3 mb-5 flex-col gap-2')
        }
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
  return (
    <p className="alertsCoverageNote forecast-col mt-4 text-center text-[0.85rem] text-white/45">
      Weather alerts aren&apos;t available for this area yet.
    </p>
  );
};

export default WeatherAlerts;
