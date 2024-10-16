import type { RenderPass, Uniforms } from "../types";
import { QuadPassOptions, useQuadRenderPass } from "./useQuadRenderPass";

export function useEffectPass<U extends Uniforms>(options: QuadPassOptions<U>): RenderPass<U> {
	return useQuadRenderPass(undefined, options);
}
