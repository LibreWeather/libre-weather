import { matomoTarget, type RuntimeConfig } from './config';

export type PromptId = 'install' | 'analytics';

export type PromptEligibility = {
  install: boolean;
  analytics: boolean;
};

/**
 * The install sheet is eligible when it has not been dismissed and this device can install.
 * @param {{ dismissed: boolean, standalone: boolean, canPrompt: boolean, ios: boolean }} options
 * @returns {boolean}
 */
export const installBannerEligible = ({
  dismissed,
  standalone,
  canPrompt,
  ios,
}: {
  dismissed: boolean;
  standalone: boolean;
  canPrompt: boolean;
  ios: boolean;
}) => !dismissed && !standalone && (canPrompt || ios);

/**
 * The analytics sheet appears only when this deploy has a Matomo server and site id, and the user has not answered yet.
 * @param {RuntimeConfig | null | undefined} config runtime config, after it has loaded
 * @param {boolean} asked preferences.analyticsAsked
 * @returns {boolean}
 */
export const analyticsSheetEligible = (config: RuntimeConfig | null | undefined, asked: boolean) =>
  !asked && matomoTarget(config) != null;

/**
 * Install sits on top of the stack. Analytics shows only once install is out of the way.
 * @param {PromptEligibility} eligible which sheets may show
 * @returns {PromptId | null}
 */
export const frontPrompt = (eligible: PromptEligibility): PromptId | null => {
  if (eligible.install) return 'install';
  if (eligible.analytics) return 'analytics';
  return null;
};

/** Another sheet is waiting under the one on screen. */
export const hasPromptBehind = (front: PromptId | null, eligible: PromptEligibility) => {
  if (front === 'install') return eligible.analytics;
  if (front === 'analytics') return eligible.install;
  return false;
};
