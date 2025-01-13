export type WebGLContextOptions = WebGLContextAttributes & {
  colorSpace?: PredefinedColorSpace;
};

export function useWebGLContext<T extends HTMLCanvasElement | OffscreenCanvas | string>(
  canvas: T,
  options?: WebGLContextOptions,
) {
  const canvasElement: HTMLCanvasElement | OffscreenCanvas | null =
    typeof canvas === "string" ? document.querySelector<HTMLCanvasElement>(canvas) : canvas;

  if (canvasElement == null) {
    throw new Error("Canvas element not found.");
  }

  const gl = canvasElement.getContext("webgl2", options) as WebGL2RenderingContext;
  if (!gl) {
    throw new Error("No WebGL2 context available.");
  }

  if ("drawingBufferColorSpace" in gl && options?.colorSpace != undefined) {
    gl.drawingBufferColorSpace = options.colorSpace;
  }

  function setSize(width: number, height: number) {
    canvasElement!.width = width;
    canvasElement!.height = height;
    gl.viewport(0, 0, width, height);
  }

  return {
    canvas: canvasElement as T extends OffscreenCanvas ? OffscreenCanvas : HTMLCanvasElement,
    gl,
    setSize,
  };
}
