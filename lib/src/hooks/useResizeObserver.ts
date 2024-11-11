/**
 * Listen for changes to the size of an element.
 */
export function useResizeObserver(
	target: HTMLElement,
	callback: (args: {
		/**
		 * size of the observed element in CSS pixels
		 */
		size: { width: number; height: number };
		/**
		 * size of the observed element in device pixels
		 */
		devicePixelSize: { width: number; height: number };
		/**
		 * untouched, native observer entries
		 */
		entries: ResizeObserverEntry[];
	}) => void,
) {
	let size: ResizeObserverSize;
	let devicePixelSize: ResizeObserverSize;

	const observer = new ResizeObserver((entries) => {
		const entry = entries.find((entry) => entry.target === target)!;

		size = entry.contentBoxSize[0];
		devicePixelSize = entry.devicePixelContentBoxSize?.[0] || {
			blockSize: Math.round(size.blockSize * window.devicePixelRatio),
			inlineSize: Math.round(size.inlineSize * window.devicePixelRatio),
		};

		// call the callback after the next paint, otherwise there are glitches when resizing a canvas
		// with an active render loop
		setTimeout(() => {
			callback({
				size: { width: size.inlineSize, height: size.blockSize },
				devicePixelSize: { width: devicePixelSize.inlineSize, height: devicePixelSize.blockSize },
				entries,
			});
		}, 0);
	});

	observer.observe(target);

	return {
		disconnect: observer.disconnect,
		observe: () => {
			observer.observe(target);
		},
		unobserve: () => {
			observer.unobserve(target);
		},
	};
}
