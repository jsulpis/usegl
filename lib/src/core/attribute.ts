import type { Attribute } from "../types/types";
import { createAndBindBuffer, getBufferData } from "./buffer";

/**
 * Sets up a vertex attribute for a given shader program.
 *
 * This function handles buffer creation, binding, and attribute pointer configuration.
 * It also supports special handling for the "index" attribute (ELEMENT_ARRAY_BUFFER).
 *
 * @param gl - The WebGL2 context.
 * @param program - The WebGL program containing the attribute.
 * @param name - The name of the attribute in the shader.
 * @param attribute - The attribute data and configuration.
 * @returns An object containing the attribute location and computed vertex count.
 */
export function setAttribute(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
  attribute: Attribute,
) {
  const bufferData = getBufferData(attribute.data, name === "index");
  const location = gl.getAttribLocation(program, name);

  if (name === "index") {
    createAndBindBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, bufferData);

    if (location === -1) {
      return { location, vertexCount: bufferData.length };
    }
  }

  if (location === -1) {
    console.warn(`No location found for attribute "${name}".`);
    return { location, vertexCount: 0 };
  }

  createAndBindBuffer(gl, gl.ARRAY_BUFFER, bufferData);

  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(
    location,
    attribute.size,
    attribute.type || getGLType(gl, bufferData),
    attribute.normalize || false,
    attribute.stride || 0,
    attribute.offset || 0,
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  const vertexCount = attribute.stride
    ? bufferData.byteLength / attribute.stride
    : bufferData.length / attribute.size;

  if (!Number.isInteger(vertexCount)) {
    console.warn(
      `The computed vertex count of the "${name}" attribute is not an integer: ${vertexCount}. There might be an issue with the provided ${attribute.stride === undefined ? "size" : "stride"}.`,
    );
  }

  return { location, vertexCount };
}

function getGLType(gl: WebGL2RenderingContext, data: ArrayBufferView) {
  if (data instanceof Float32Array) return gl.FLOAT;
  if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) return gl.UNSIGNED_BYTE;
  if (data instanceof Int8Array) return gl.BYTE;
  if (data instanceof Uint16Array) return gl.UNSIGNED_SHORT;
  if (data instanceof Int16Array) return gl.SHORT;
  if (data instanceof Uint32Array) return gl.UNSIGNED_INT;
  if (data instanceof Int32Array) return gl.INT;
  return gl.FLOAT;
}
