// Open a native modal and restore the triggering control after it closes.
import { useLayoutEffect, useRef } from 'react';

export function useModalDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      if (document.fullscreenElement === dialog) document.exitFullscreen().catch(() => {});
      dialog.close();
      queueMicrotask(() => { if (previous?.isConnected) previous.focus({ preventScroll: true }); });
    };
  }, []);
  return ref;
}
