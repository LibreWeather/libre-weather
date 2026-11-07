import { useCallback, useEffect, useRef, type MouseEvent } from 'react';

/**
 * Opens a `<dialog>` as a modal on mount; clicks on the backdrop close it.
 * The close control calls `onClose` itself. `dialog.close()` drops `open` without a `close`
 * event under Cypress's Electron, so waiting on that event leaves the dialog mounted.
 * @param {() => void} [onClose] drops the dialog's URL param
 * @returns {{ ref, close: () => void, onBackdropClick: (event: MouseEvent) => void }}
 */
export const useModalDialog = (onClose?: () => void) => {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const closed = useRef(false);

  const close = useCallback(() => {
    if (closed.current) return;
    closed.current = true;
    onCloseRef.current?.();
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (!node.open) node.showModal();
    // Escape still closes through the dialog. The button does not rely on this.
    node.addEventListener('close', close);
    return () => node.removeEventListener('close', close);
  }, [close]);

  const onBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) close();
    },
    [close]
  );

  return { ref, close, onBackdropClick };
};
