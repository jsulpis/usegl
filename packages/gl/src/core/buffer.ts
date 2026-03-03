import type { TypedArray } from "../types";

export function createAndBindBuffer(
  gl: WebGL2RenderingContext,
  target: GLenum,
  data: TypedArray | number[],
) {
  const buffer = gl.createBuffer();
  const bufferData = getBufferData(data);
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, bufferData, gl.STATIC_DRAW);

  return buffer;
}

export function getBufferData(data: TypedArray | number[], isIndex?: boolean) {
  if (ArrayBuffer.isView(data)) {
    return data;
  }
  if (isIndex) {
    return data.length < 65_536 ? new Uint16Array(data) : new Uint32Array(data);
  }
  return new Float32Array(data);
}
