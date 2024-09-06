export function useWebGLContext(
	canvas: HTMLCanvasElement | OffscreenCanvas,
	options?: WebGLContextAttributes
) {
	const gl = canvas.getContext("webgl2", options);
	if (!gl) {
		console.error("WebGL2 context unavailable");
		return {};
	}

	function setSize(width: number, height: number) {
		canvas.width = width;
		canvas.height = height;
		gl.viewport(0, 0, width, height);
	}

	return { canvas, gl, setSize };
}
