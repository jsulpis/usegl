export function useWebGLContext(
	canvas: HTMLCanvasElement | OffscreenCanvas | string,
	options?: WebGLContextAttributes,
) {
	const canvasElement =
		typeof canvas === "string" ? document.querySelector<HTMLCanvasElement>(canvas) : canvas;

	if (canvasElement == null) {
		throw new Error("Canvas element not found.");
	}

	const gl = canvasElement.getContext("webgl2", options) as WebGL2RenderingContext;
	if (!gl) {
		throw new Error("No WebGL2 context available.");
	}

	function setSize(width: number, height: number) {
		canvasElement!.width = width;
		canvasElement!.height = height;
		gl.viewport(0, 0, width, height);
	}

	return { canvas: canvasElement, gl, setSize };
}
