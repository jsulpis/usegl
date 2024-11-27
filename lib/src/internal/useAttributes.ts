import { setAttribute } from "../core/attribute";
import type { Attribute } from "../types";

const UNSIGNED_INT = WebGL2RenderingContext.UNSIGNED_INT;
const UNSIGNED_SHORT = WebGL2RenderingContext.UNSIGNED_SHORT;

export function useAttributes(attributes: Record<string, Attribute>) {
  let _gl: WebGL2RenderingContext;
  let _vao: WebGLVertexArrayObject | null;

  let vertexCount = 0;

  function initialize(gl: WebGL2RenderingContext, program: WebGLProgram) {
    _gl = gl;
    _vao = _gl.createVertexArray();
    _gl.bindVertexArray(_vao);

    for (const [attributeName, attributeObj] of Object.entries(attributes)) {
      const attr = setAttribute(_gl, program, attributeName, attributeObj);
      vertexCount = Math.max(vertexCount, attr.vertexCount);
    }
  }

  const hasIndices = attributes.index != undefined;
  const indexType = attributes.index?.data.length < Math.pow(2, 16) ? UNSIGNED_SHORT : UNSIGNED_INT;

  function getVertexCount() {
    return vertexCount;
  }

  function bindVAO() {
    _gl.bindVertexArray(_vao);
  }

  return {
    initialize,
    getVertexCount,
    bindVAO,
    hasIndices,
    indexType,
  };
}
