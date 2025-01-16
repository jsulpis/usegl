import type { EffectPass, EffectUniforms } from "../types";
import type { QuadPassOptions } from "./useQuadRenderPass";
import { useQuadRenderPass } from "./useQuadRenderPass";

export function useEffectPass<U extends EffectUniforms>(
  options: QuadPassOptions<U>,
): EffectPass<U> {
  return useQuadRenderPass(undefined, options);
}
