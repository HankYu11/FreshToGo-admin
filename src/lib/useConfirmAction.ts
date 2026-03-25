import { useCallback, useRef, useState } from 'react';

export function useConfirmAction(action: () => Promise<void>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const actionRef = useRef(action);
  actionRef.current = action;

  const requestConfirm = useCallback(() => setOpen(true), []);
  const cancel = useCallback(() => setOpen(false), []);

  const confirm = useCallback(async () => {
    setLoading(true);
    try {
      await actionRef.current();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }, []);

  return { open, loading, requestConfirm, confirm, cancel };
}
