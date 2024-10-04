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

	new ResizeObserver((entries) => {
		devicePixelSize = entries[0].devicePixelContentBoxSize[0];
		size = entries[0].contentBoxSize[0];

		// resize after next paint, otherwise there are glitches if a render loop is active
		setTimeout(() => {
			callback({
				size: { width: size.inlineSize, height: size.blockSize },
				devicePixelSize: { width: devicePixelSize.inlineSize, height: devicePixelSize.blockSize },
			});
		}, 0);
	}).observe(canvas);
}
