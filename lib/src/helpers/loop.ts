export function loop(callback: ({ time, deltaTime }: { time: number; deltaTime: number }) => void) {
	const startTime = performance.now();

	requestAnimationFrame((time) => {
		const deltaTime = time - startTime;
		callback({ time, deltaTime });
		loop(callback);
	});
}
