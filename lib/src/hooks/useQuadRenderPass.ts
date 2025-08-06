import type { Uniforms } from "../types";
import { useRenderPass, type RenderPassOptions } from "./useRenderPass";
import { findAttributeName, findVaryingName } from "../internal/findName";

export type QuadPassOptions<U extends Uniforms = Record<string, never>> = Omit<
  RenderPassOptions<U>,
  "vertex"
> & { vertex?: string };

export function useQuadRenderPass<U extends Uniforms>(
  gl: WebGL2RenderingContext | undefined,
  { attributes = {}, fragment, vertex, ...renderPassOptions }: QuadPassOptions<U>,
) {
  const uvVaryingName = findVaryingName(fragment, "uv");

  const vertexShader =
    vertex ||
    (uvVaryingName
      ? quadVertexShaderSource.replace(/\bvUv\b/g, uvVaryingName)
      : quadVertexShaderSource);

  const hasPositionAttribute = Object.keys(attributes).some((attributeName) =>
    attributeName.toLocaleLowerCase().endsWith("position"),
  );

  if (!hasPositionAttribute) {
    const positionAttributeName = findAttributeName(vertexShader, "position");
    if (positionAttributeName) {
      attributes[positionAttributeName] = {
        size: 2,
        data: quadVertexPositions,
      };
    }
  }

  return useRenderPass(gl, {
    ...renderPassOptions,
    attributes,
    fragment,
    vertex: vertexShader,
  });
}

const quadVertexShaderSource = /*glsl*/ `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vUv = (aPosition + 1.0) / 2.0;
}
`;

/**
 * 1 big triangle filling the canvas offers better performance than 2 triangles :
 * @see https://github.com/pmndrs/postprocessing?tab=readme-ov-file#performance
 * @see https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
 */
const quadVertexPositions = [-1, -1, 3, -1, -1, 3];
