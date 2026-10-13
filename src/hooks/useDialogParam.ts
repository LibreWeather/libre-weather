import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

type DialogState = { dialogOpenedInApp?: string } | null;

/**
 * Tie a dialog to a search param so it can be linked to and closed with Back.
 * Dialogs opened in-app pop their history entry on close; ones opened from a link just drop the param.
 * @param {string} param search param holding the dialog's value
 * @returns {{ value: string | null, open: (value?: string) => void, close: () => void }}
 */
const useDialogParam = (param: string) => {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const value = params.get(param);

  const open = (next = '') => {
    const updated = new URLSearchParams(params);
    updated.set(param, next);
    setParams(updated, { state: { dialogOpenedInApp: param } });
  };

  const close = () => {
    if ((location.state as DialogState)?.dialogOpenedInApp === param) {
      navigate(-1);
      return;
    }
    const updated = new URLSearchParams(params);
    updated.delete(param);
    setParams(updated, { replace: true });
  };

  return { value, open, close };
};

export default useDialogParam;
