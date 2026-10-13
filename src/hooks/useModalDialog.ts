import { useCallback, useEffect, useRef, type MouseEvent } from 'react';

/**
 * Opens a `<dialog>` as a modal on mount; clicks on the backdrop close it.
 * @returns {{ ref, close: () => void, onBackdropClick: (event: MouseEvent) => void }}
 */
export const useModalDialog = () => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node && !node.open) node.showModal();
  }, []);

  const close = useCallback(() => ref.current?.close(), []);

  const onBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) close();
    },
    [close]
  );

  return { ref, close, onBackdropClick };
};
