import type { RenderTarget } from "../types";
import { fillTexture } from "./texture";

export function createRenderTarget(
  gl: WebGL2RenderingContext,
  size?: { width: number; height: number },
): RenderTarget {
  let _width = size?.width ?? gl.canvas.width;
  let _height = size?.height ?? gl.canvas.height;

  const framebuffer = gl.createFramebuffer();

  let _texture = gl.createTexture()!;
  fillTexture(gl, _texture, {
    data: null,
    width: _width,
    height: _height,
    generateMipmaps: false,
  });

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, _texture, 0);
  gl.bindTexture(gl.TEXTURE_2D, null);

  function setSize(width: number, height: number) {
    _width = width;
    _height = height;

    const newTexture = gl.createTexture()!;
    fillTexture(gl, newTexture, {
      data: null,
      width,
      height,
      generateMipmaps: false,
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, width, height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, newTexture, 0);

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

export function setRenderTarget(gl: WebGL2RenderingContext, target: RenderTarget | null) {
  const framebuffer = target?.framebuffer || null;
  const { width, height } = target || gl.canvas;

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, width, height);
}
