import type { RenderTargetParams } from "../core/renderTarget";
import { createRenderTarget } from "../core/renderTarget";
import type { UniformValue, Uniforms } from "../types";
import type { QuadPassParams } from "./quadRenderPass";
import { quadRenderPass } from "./quadRenderPass";
import type { RenderPass } from "./renderPass";

/**
 * Creates a post-processing effect pass that renders a full-screen quad.
 *
 * @param params - Configuration for the effect pass.
 * @returns An {@link EffectPass} object.
 */
export function effectPass<U extends EffectUniforms>(params: EffectPassParams<U>): EffectPass<U> {
  const { target = floatTargetConfig, resolutionScale = 1 } = params;

  const renderPass = quadRenderPass(undefined, { ...params, target: null });

  renderPass.onInit((gl) => {
    if (target == null || "framebuffer" in target) return;
    renderPass.setTarget(
      createRenderTarget(gl, {
        ...target,
        width: (target.width ?? gl.canvas.width) * resolutionScale,
        height: (target.height ?? gl.canvas.height) * resolutionScale,
      }),
    );
  });

  return renderPass;
}

/**
 * Default configuration for high-precision floating point render targets.
 * Useful for HDR and post-processing effects.
 */
export const floatTargetConfig: RenderTargetParams = {
  internalFormat: WebGL2RenderingContext.RGBA16F,
  type: WebGL2RenderingContext.HALF_FLOAT,
};

/**
 * An alias for {@link RenderPass}, specifically used in the context of post-processing effects.
 */
export type EffectPass<U extends Uniforms = Record<string, never>> = RenderPass<U>;

/**
 * Uniforms specifically used in post-processing effects.
 * Supports functional values that receive information about the previous rendering passes.
 */
export type EffectUniforms = Record<
  string,
  | UniformValue
  | ((passes: {
      /**
       * - in an effect with only one pass, the inputPass is the pass rendered before this effect.
       * - in an effect with multiple passes, the inputPass is the pass rendered before the first pass of the effect.
       */
      inputPass: RenderPass;
      /**
       * The pass rendered immediately before this specific effect pass.
       */
      previousPass: RenderPass;
    }) => UniformValue)
>;

/**
 * Parameters for creating an {@link effectPass}.
 */
export type EffectPassParams<U extends EffectUniforms> = Omit<QuadPassParams<U>, "target"> & {
  /**
   * Parameters to create the render target for this pass.
   * If null, it will render to the provided target or canvas.
   */
  target?: RenderTargetParams | null;
};
