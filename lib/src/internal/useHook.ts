export function useHook<C extends (...args: any[]) => any = () => void>() {
  const callbacks: C[] = [];

  function registerCallback(callback: C) {
    callbacks.push(callback);
  }

  function executeCallbacks(...params: Parameters<C>) {
    for (const callback of callbacks) {
      callback(...params);
    }
  }

  return [registerCallback, executeCallbacks] as const;
}
