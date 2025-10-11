import type { RenderTargetParams } from "../core/renderTarget";
import { createRenderTarget } from "../core/renderTarget";
import type { EffectPass, EffectUniforms } from "../types";
import type { QuadPassOptions } from "./useQuadRenderPass";
import { useQuadRenderPass } from "./useQuadRenderPass";

type EffectPassOptions<U extends EffectUniforms> = Omit<QuadPassOptions<U>, "target"> & {
  /**
   * Params to create the render target of the pass.
   */
  target?: RenderTargetParams | null;
};

export const floatTargetConfig: RenderTargetParams = {
  internalFormat: WebGL2RenderingContext.RGBA16F,
  type: WebGL2RenderingContext.HALF_FLOAT,
};

export function useEffectPass<U extends EffectUniforms>(
  options: EffectPassOptions<U>,
): EffectPass<U> {
  const { target = floatTargetConfig, resolutionScale = 1 } = options;

  const renderPass = useQuadRenderPass(undefined, { ...options, target: null });

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
