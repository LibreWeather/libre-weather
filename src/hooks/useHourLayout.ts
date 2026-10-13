import { PHONE_QUERY, TABLET_QUERY } from '@/utilities/media';
import { useMediaQuery } from './useMediaQuery';

/** How many hours each overview bar chunk covers, and whether bars are too narrow for labels. */
export const useHourLayout = () => {
  const phone = useMediaQuery(PHONE_QUERY);
  const tablet = useMediaQuery(TABLET_QUERY);
  return { stride: phone || tablet ? 3 : 2, narrow: phone };
};
