import { createAndBindBuffer } from "../core/buffer";
import type { Attribute, RenderPass, Uniforms } from "../types";
import { useRenderPass } from "./useRenderPass";

interface TransformFeedbackOptions<O extends string, U extends Uniforms = Record<string, never>> {
  vertex: string;
  attributes?: Record<string, Attribute>;
  uniforms?: U;
  outputs: Record<O, { size: number }>;
}

interface TransformFeedbackPass<O extends string, U extends Uniforms = Record<string, never>>
  extends Omit<
    RenderPass<U>,
    "initialize" | "target" | "setTarget" | "setSize" | "vertex" | "fragment"
  > {
  getOutputData: (bufferName: O) => Float32Array;
  outputBuffers: Record<O, WebGLBuffer>;
}

export function useTransformFeedback<O extends string, U extends Uniforms>(
  gl: WebGL2RenderingContext,
  { vertex, attributes = {}, uniforms = {} as U, outputs }: TransformFeedbackOptions<O, U>,
) {
  const firstAttribute = Object.values(attributes)[0];
  const vertexCount = firstAttribute ? firstAttribute.data!.length / firstAttribute.size : 0;

  const outputBuffers = Object.fromEntries(
    Object.entries<{ size: number }>(outputs).map(([name, { size }]) => [
      name,
      createAndBindBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vertexCount * size)),
    ]),
  ) as Record<O, WebGLBuffer>;

  const renderPass = useRenderPass(gl, {
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

  renderPass.onBeforeRender(() => {
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.beginTransformFeedback(gl.POINTS);
  });

  renderPass.onAfterRender(() => {
    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.disable(gl.RASTERIZER_DISCARD);
  });

  const tfRenderPass: TransformFeedbackPass<O, U> = Object.assign(renderPass, {
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
