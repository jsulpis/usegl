/**
 * Initializes a WebGL2 rendering context for a given canvas.
 *
 * @param canvas - The canvas element to use or a CSS selector to query it.
 * @param params - WebGL2 context attributes and color space configuration.
 * @throws Error if the canvas or WebGL2 context could not be created.
 */
export function glContext<T extends HTMLCanvasElement | OffscreenCanvas | string>(
  canvas: T,
  params?: WebGLContextParams,
) {
  let canvasElement: HTMLCanvasElement | OffscreenCanvas | null = null;

  if (typeof canvas === "string") {
    if (typeof document !== "undefined") {
      canvasElement = document.querySelector<HTMLCanvasElement>(canvas);
    }
  } else {
    canvasElement = canvas;
  }

  if (canvasElement == null) {
    throw new Error("Canvas element not found.");
  }

  const gl = canvasElement.getContext("webgl2", params) as WebGL2RenderingContext;
  if (!gl) {
    throw new Error("No WebGL2 context available.");
  }

  if ("drawingBufferColorSpace" in gl && params?.colorSpace != undefined) {
    gl.drawingBufferColorSpace = params.colorSpace;
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

/**
 * Configuration params for the WebGL2 context.
 * @inline
 * @internal
 */
export type WebGLContextParams = WebGLContextAttributes & {
  /**
   * The color space to use for the drawing buffer.
   */
  colorSpace?: "srgb" | "display-p3";
};
