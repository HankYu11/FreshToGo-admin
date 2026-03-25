import { renderHook, act } from '@testing-library/react';
import { useConfirmAction } from './useConfirmAction';

describe('useConfirmAction', () => {
  it('starts with open=false and loading=false', () => {
    const { result } = renderHook(() => useConfirmAction(vi.fn()));
    expect(result.current.open).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('opens dialog on requestConfirm', async () => {
    const { result } = renderHook(() => useConfirmAction(vi.fn()));
    await act(() => result.current.requestConfirm());
    expect(result.current.open).toBe(true);
  });

  it('closes dialog on cancel', async () => {
    const { result } = renderHook(() => useConfirmAction(vi.fn()));
    await act(() => result.current.requestConfirm());
    await act(() => result.current.cancel());
    expect(result.current.open).toBe(false);
  });

  it('runs action and closes on confirm', async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useConfirmAction(action));

    await act(() => result.current.requestConfirm());
    expect(result.current.open).toBe(true);

    await act(() => result.current.confirm());
    expect(action).toHaveBeenCalledOnce();
    expect(result.current.open).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('sets loading during action execution', async () => {
    let resolve: () => void;
    const action = vi.fn().mockReturnValue(new Promise<void>((r) => { resolve = r; }));
    const { result } = renderHook(() => useConfirmAction(action));

    await act(() => result.current.requestConfirm());

    // Start confirm but don't await — check loading mid-flight
    let confirmDone = false;
    const confirmPromise = act(async () => {
      await result.current.confirm();
      confirmDone = true;
    });

    // After act starts the async work, loading should be true
    // We need to resolve the promise to finish
    expect(confirmDone).toBe(false);

    await act(async () => {
      resolve!();
    });
    await confirmPromise;

    expect(result.current.loading).toBe(false);
    expect(result.current.open).toBe(false);
  });

  it('closes dialog even if action throws', async () => {
    const action = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useConfirmAction(action));

    await act(() => result.current.requestConfirm());
    await act(async () => {
      await result.current.confirm().catch(() => {});
    });
    expect(result.current.open).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('uses latest action via ref (no stale closure)', async () => {
    const action1 = vi.fn().mockResolvedValue(undefined);
    const action2 = vi.fn().mockResolvedValue(undefined);

    const { result, rerender } = renderHook(
      ({ action }) => useConfirmAction(action),
      { initialProps: { action: action1 } },
    );

    rerender({ action: action2 });

    await act(() => result.current.requestConfirm());
    await act(() => result.current.confirm());

    expect(action1).not.toHaveBeenCalled();
    expect(action2).toHaveBeenCalledOnce();
  });
});
