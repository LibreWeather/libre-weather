import { focusRing, PromptSheet } from './PromptSheet';

const button = `flex-none rounded-[0.55rem] px-[0.8rem] py-[0.45rem] font-semibold ${focusRing}`;

const AnalyticsBanner = ({ onAllow, onDecline }: { onAllow: () => void; onDecline: () => void }) => (
  <PromptSheet label="Share anonymous usage">
    <div className="flex min-w-0 flex-1 flex-col leading-[1.35]">
      <strong>Share anonymous usage?</strong>
      <span className="text-[0.85em] text-white/70">
        A count of pages opened. You can turn this off anytime in preferences.
      </span>
    </div>
    <button
      type="button"
      className={`${button} text-white/75 hover:text-white`}
      onClick={onDecline}>
      No thanks
    </button>
    <button
      type="button"
      className={`${button} bg-accent text-white hover:bg-[#2f6fd8]`}
      onClick={onAllow}>
      Share
    </button>
  </PromptSheet>
);

export default AnalyticsBanner;
