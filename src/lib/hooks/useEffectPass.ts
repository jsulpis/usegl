import type { RenderPass, Uniforms as UniformsType } from "../types";
import { useQuadRenderPass } from "./useQuadRenderPass";
import type { RenderPassOptions } from "./useRenderPass";

export function useEffectPass<Uniforms extends UniformsType>(
	options: RenderPassOptions<Uniforms>
): RenderPass<Uniforms> {
	return useQuadRenderPass(undefined, options);
}
