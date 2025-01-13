import type { EffectUniforms, RenderPass } from "../types";
import type { QuadPassOptions } from "./useQuadRenderPass";
import { useQuadRenderPass } from "./useQuadRenderPass";

export function useEffectPass<U extends EffectUniforms>(
  options: QuadPassOptions<U>,
): RenderPass<U> {
  return useQuadRenderPass(undefined, options);
}
