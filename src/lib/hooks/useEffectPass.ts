import { createRenderTarget } from "../core/renderTarget";
import type { EffectPass, RenderPass, RenderTarget, Uniforms as UniformsType } from "../types";
import { useQuadRenderPass } from "./useQuadRenderPass";
import type { RenderPassOptions } from "./useRenderPass";

interface PostProcessingPassOptions<Uniforms extends UniformsType>
	extends RenderPassOptions<Uniforms> {
	target?: RenderTarget;
	width?: number;
	height?: number;
}

export function useEffectPass<Uniforms extends UniformsType>({
	target,
	width,
	height,
	...renderPassOptions
}: PostProcessingPassOptions<Uniforms>): EffectPass<Uniforms> {
	let renderPass: RenderPass<Uniforms> = {
		render: () => {},
		setTarget: () => {},
		setSize: () => {},
		target: { texture: {} } as RenderTarget,
		uniforms: {} as Uniforms,
		vertex: "",
		fragment: "",
	};

	function initialize(gl: WebGL2RenderingContext, target: RenderTarget | null) {
		renderPass = useQuadRenderPass(gl, {
			...renderPassOptions,
			target: target !== undefined ? target : createRenderTarget(gl, { width, height }),
		});
	}

	return {
		get render() {
			return renderPass.render;
		},
		get target() {
			return renderPass.target;
		},
		get setTarget() {
			return renderPass.setTarget;
		},
		get setSize() {
			return renderPass.setSize;
		},
		get uniforms() {
			return renderPass.uniforms;
		},
		get vertex() {
			return renderPass.vertex;
		},
		get fragment() {
			return renderPass.fragment;
		},
		initialize,
	};
}
