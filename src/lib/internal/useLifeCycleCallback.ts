export function useLifeCycleCallback<C>() {
	const callbacks: C[] = [];

	function addCallback(callback: C) {
		callbacks.push(callback);
	}

	return [callbacks, addCallback] as const;
}
