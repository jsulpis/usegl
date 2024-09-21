import { createRenderTarget } from "../core/renderTarget";
import type { RenderTarget, Uniforms as UniformsType } from "../types";
import { useQuadRenderPass } from "./useQuadRenderPass";
import type { RenderPassOptions } from "./useRenderPass";

interface PostProcessingPassOptions<Uniforms extends UniformsType>
	extends RenderPassOptions<Uniforms> {
	target?: RenderTarget;
	width?: number;
	height?: number;
}

export function useEffectPass<Uniforms extends UniformsType>(
	gl: WebGL2RenderingContext,
	{ target, width, height, ...renderPassOptions }: PostProcessingPassOptions<Uniforms>
) {
	const renderTarget = target !== undefined ? target : createRenderTarget(gl, { width, height });

	const renderPass = useQuadRenderPass(gl, {
		...renderPassOptions,
		target: renderTarget,
	});

	return { ...renderPass, target: renderTarget };
}
