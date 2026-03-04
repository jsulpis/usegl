import { createAndBindBuffer } from "../core/buffer";
import type { Attribute, Uniforms } from "../types";
import type { RenderPass } from "./renderPass";
import { renderPass } from "./renderPass";

/**
 * Creates a Transform Feedback pass for GPGPU tasks without rendering to a texture.
 *
 * It allows you to run a vertex shader and capture its output varyings into buffers
 * that can then be read back by the CPU or used as input for another pass.
 *
 * @param gl - The WebGL2 context.
 * @param params - Configuration for the transform feedback pass.
 * @returns A {@link TransformFeedbackPass} object.
 */
export function transformFeedback<O extends string, U extends Uniforms>(
  gl: WebGL2RenderingContext,
  { vertex, attributes = {}, uniforms = {} as U, outputs }: TransformFeedbackParams<O, U>,
) {
  const firstAttribute = Object.values(attributes)[0];
  const vertexCount = firstAttribute ? firstAttribute.data!.length / firstAttribute.size : 0;

  const outputBuffers = Object.fromEntries(
    Object.entries<{ size: number }>(outputs).map(([name, { size }]) => [
      name,
      createAndBindBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertexCount * size)),
    ]),
  ) as Record<O, WebGLBuffer>;

  const mainPass = renderPass(gl, {
    fragment: `void main() { gl_FragColor = vec4(0.0); }`,
    vertex,
    attributes,
    uniforms,
    transformFeedbackVaryings: Object.keys(outputs),
    drawMode: "POINTS",
  });

  const tf = gl.createTransformFeedback();
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);

  for (const [index, buffer] of Object.values(outputBuffers).entries()) {
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, index, buffer as WebGLBuffer);
  }

  mainPass.onBeforeRender(() => {
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.beginTransformFeedback(gl.POINTS);
  });

  mainPass.onAfterRender(() => {
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.disable(gl.RASTERIZER_DISCARD);
  });

  const tfRenderPass: TransformFeedbackPass<O, U> = Object.assign(mainPass, {
    getOutputData: function (bufferName: O) {
      const output = new Float32Array(vertexCount * outputs[bufferName].size);
      const buffer = outputBuffers[bufferName];
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.getBufferSubData(gl.ARRAY_BUFFER, 0, output);
      return output;
    },
    outputBuffers,
  });

  return tfRenderPass;
}

/**
 * Parameters for the {@link transformFeedback} pass.
 */
export interface TransformFeedbackParams<
  O extends string,
  U extends Uniforms = Record<string, never>,
> {
  /** Vertex shader source. Should write to the output varyings. */
  vertex: string;
  /** Vertex attributes (input buffers). */
  attributes?: Record<string, Attribute>;
  /** Uniform values for the pass. */
  uniforms?: U;
  /**
   * Definition of the transform feedback output buffers.
   * Maps varying names to their expected component size (e.g., 3 for vec3).
   */
  outputs: Record<O, { size: number }>;
}

/**
 * Specialized render pass for Transform Feedback.
 */
export interface TransformFeedbackPass<O extends string, U extends Uniforms = Record<string, never>>
  extends Omit<
    RenderPass<U>,
    "initialize" | "target" | "setTarget" | "setSize" | "vertex" | "fragment"
  > {
  /** Retrieves data from a specific output buffer. */
  getOutputData: (bufferName: O) => Float32Array;
  /** Raw WebGLBuffer handles for each output varying. */
  outputBuffers: Record<O, WebGLBuffer>;
}
