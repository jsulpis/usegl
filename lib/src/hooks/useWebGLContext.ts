export function useWebGLContext(
	canvas: HTMLCanvasElement | OffscreenCanvas,
	options?: WebGLContextAttributes,
) {
	const gl = canvas.getContext("webgl2", options) as WebGL2RenderingContext;
	if (!gl) {
		throw new Error("No WebGL2 context available.");
	}

	function setSize(width: number, height: number) {
		canvas.width = width;
		canvas.height = height;
		gl.viewport(0, 0, width, height);
	}

	return { canvas, gl, setSize };
}
