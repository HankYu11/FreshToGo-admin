import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

export function useConfirmAction(
  action: () => Promise<void>,
  options: { errorMessage?: string } = {},
) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const actionRef = useRef(action);
  actionRef.current = action;
  const errorMessage = options.errorMessage ?? 'Operation failed';

  const requestConfirm = useCallback(() => setOpen(true), []);
  const cancel = useCallback(() => setOpen(false), []);

  const confirm = useCallback(async () => {
    setLoading(true);
    try {
      await actionRef.current();
    } catch {
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }, [errorMessage]);

  return { open, loading, requestConfirm, confirm, cancel };
}
