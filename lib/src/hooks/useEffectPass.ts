import type { RenderTargetParams } from "../core/renderTarget";
import { createRenderTarget } from "../core/renderTarget";
import type { EffectPass, EffectUniforms } from "../types";
import type { QuadPassOptions } from "./useQuadRenderPass";
import { useQuadRenderPass } from "./useQuadRenderPass";

type EffectPassOptions<U extends EffectUniforms> = Omit<QuadPassOptions<U>, "target"> & {
  /**
   * Allow to scale the render target texture based on size given to the pass.
   */
  resolutionScale?: number;
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

  const renderPassSetSize = renderPass.setSize;
  renderPass.setSize = function ({ width, height }) {
    renderPassSetSize({
      width: Math.ceil(width * resolutionScale),
      height: Math.ceil(height * resolutionScale),
    });
  };

  const renderPassInitialize = renderPass.initialize;
  renderPass.initialize = function (gl) {
    if (target != null && !("framebuffer" in target)) {
      renderPass.setTarget(createRenderTarget(gl, target));
    }
    renderPassInitialize(gl);
  };

  return renderPass;
}
