export function useLifeCycleCallback<C = () => void>() {
  const callbacks: C[] = [];

  function addCallback(callback: C) {
    callbacks.push(callback);
  }

  return [callbacks, addCallback] as const;
}
