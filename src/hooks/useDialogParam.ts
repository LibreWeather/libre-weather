import { navigate, useLocation } from './useLocation';

type DialogState = { dialogOpenedInApp?: string } | null;

/**
 * Tie a dialog to a search param so it can be linked to and closed with Back.
 * Dialogs opened in-app pop their history entry on close; ones opened from a link just drop the param.
 * @param {string} param search param holding the dialog's value
 * @returns {{ value: string | null, open: (value?: string) => void, close: () => void }}
 */
const useDialogParam = (param: string) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const value = params.get(param);

  const urlWith = (updated: URLSearchParams) => {
    const query = updated.toString();
    return `${location.pathname}${query ? `?${query}` : ''}`;
  };

  const open = (next = '') => {
    const updated = new URLSearchParams(params);
    updated.set(param, next);
    navigate(urlWith(updated), { state: { dialogOpenedInApp: param } });
  };

  const close = () => {
    if ((location.state as DialogState)?.dialogOpenedInApp === param) {
      window.history.back();
      return;
    }
    const updated = new URLSearchParams(params);
    updated.delete(param);
    navigate(urlWith(updated), { replace: true });
  };

  return { value, open, close };
};

export default useDialogParam;
