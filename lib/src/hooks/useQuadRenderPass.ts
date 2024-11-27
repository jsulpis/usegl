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
    const positionAttributeName = findAttributeName(vertex, "position") || "aPosition";

    attributes[positionAttributeName] = {
      size: 2,
      data: quadVertexPositions,
    };
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

const quadVertexPositions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
