import type { DataTextureParams } from "./texture";
import { fillTexture } from "./texture";

/**
 * Creates a {@link RenderTarget} (FrameBuffer Object) for offscreen rendering.
 *
 * @param gl - The WebGL2 context.
 * @param params - Configuration parameters for the render target and its color texture.
 * @returns A new {@link RenderTarget} object.
 */
export function createRenderTarget(
  gl: WebGL2RenderingContext,
  params?: RenderTargetParams,
): RenderTarget {
  let _width = params?.width ?? gl.canvas.width;
  let _height = params?.height ?? gl.canvas.height;

  const framebuffer = gl.createFramebuffer();

  let _texture = gl.createTexture()!;
  fillTexture(gl, _texture, {
    data: null,
    width: _width,
    height: _height,
    generateMipmaps: false,
    ...params,
  });

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, _texture, 0);

  let renderbuffer: WebGLRenderbuffer | null = null;
  if (params?.depthBuffer) {
    renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }

  gl.bindTexture(gl.TEXTURE_2D, null);

  /**
   * Resizes the render target, creating a new texture and reattaching it.
   */
  function setSize(width: number, height: number) {
    _width = width;
    _height = height;

    const newTexture = gl.createTexture()!;
    fillTexture(gl, newTexture, {
      data: null,
      ...params,
      width,
      height,
      generateMipmaps: false,
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, newTexture, 0);

    if (renderbuffer) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.deleteTexture(_texture);

    _texture = newTexture;
  }

  return {
    framebuffer,
    get texture() {
      return _texture;
    },
    get width() {
      return _width;
    },
    get height() {
      return _height;
    },
    setSize,
  };
}

/**
 * Sets the current render target for the WebGL context.
 *
 * @param gl - The WebGL2 context.
 * @param target - The render target to bind. If null, binds the canvas (default framebuffer).
 * @param clear - Whether to clear the color and depth buffers after binding.
 * @default true
 */
export function setRenderTarget(
  gl: WebGL2RenderingContext,
  target: RenderTarget | null,
  clear = true,
) {
  const framebuffer = target?.framebuffer || null;
  const { width, height } = target || gl.canvas;

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.viewport(0, 0, width, height);

  if (clear) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}

/**
 * A render target (FrameBuffer Object) for offscreen rendering.
 */
export interface RenderTarget {
  /** The underlying WebGL framebuffer. */
  framebuffer: WebGLFramebuffer;
  /** The texture attached to the framebuffer. */
  texture: WebGLTexture;
  /** Current width of the target. */
  width: number;
  /** Current height of the target. */
  height: number;
  /** Resizes the render target. */
  setSize: (width: number, height: number) => void;
}

/**
 * Parameters for creating a {@link RenderTarget}.
 */
export type RenderTargetParams = Partial<Omit<DataTextureParams, "data">> & {
  /**
   * Whether to attach a depth buffer to the render target.
   * @default false
   */
  depthBuffer?: boolean;
};
