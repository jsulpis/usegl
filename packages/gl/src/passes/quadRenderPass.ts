import type { Uniforms } from "../types";
import { renderPass, type RenderPassParams } from "./renderPass";
import { findAttributeName, findVaryingName } from "../internal/findName";

/**
 * Creates a render pass that renders a full-screen quad (actually a single large triangle).
 * This is optimized for post-processing and full-screen effects.
 *
 * @param gl - The WebGL2 context.
 * @param params - Configuration for the quad render pass.
 * @returns A {@link RenderPass} object.
 */
export function quadRenderPass<U extends Uniforms>(
  gl: WebGL2RenderingContext | undefined,
  { attributes = {}, fragment, vertex, ...renderPassParams }: QuadPassParams<U>,
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

  return renderPass(gl, {
    ...renderPassParams,
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

/**
 * Parameters for creating a {@link quadRenderPass}.
 * Inherits from {@link RenderPassParams} but makes the vertex shader optional.
 */
export type QuadPassParams<U extends Uniforms = Record<string, never>> = Omit<
  RenderPassParams<U>,
  "vertex"
> & {
  /**
   * Optional vertex shader. If not provided, a default full-screen quad vertex shader is used.
   */
  vertex?: string;
};
