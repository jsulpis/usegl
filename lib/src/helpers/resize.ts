/**
 * Listen for resize of the canvas itself instead of the whole window
 */
export function onCanvasResize(
	canvas: HTMLCanvasElement,
	callback: (args: {
		/**
		 * canvas size in CSS pixels
		 */
		size: { width: number; height: number };
		/**
		 * canvas size in device pixels
		 */
		devicePixelSize: { width: number; height: number };
	}) => void,
) {
	let size: ResizeObserverSize;
	let devicePixelSize: ResizeObserverSize;

	const observer = new ResizeObserver((entries) => {
		const entry = entries.find((entry) => entry.target === canvas)!;

		size = entry.contentBoxSize[0];
		devicePixelSize = entry.devicePixelContentBoxSize?.[0] || {
			blockSize: Math.round(size.blockSize * window.devicePixelRatio),
			inlineSize: Math.round(size.inlineSize * window.devicePixelRatio),
		};

		// resize after next paint, otherwise there are glitches if a render loop is active
		setTimeout(() => {
			callback({
				size: { width: size.inlineSize, height: size.blockSize },
				devicePixelSize: { width: devicePixelSize.inlineSize, height: devicePixelSize.blockSize },
			});
		}, 0);
	});

	observer.observe(canvas);
}
