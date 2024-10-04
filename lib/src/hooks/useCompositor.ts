import { createRenderTarget } from "../core/renderTarget";
import type { PostEffect, RenderPass, Uniforms } from "../types";
import { findUniformName } from "../internal/findName";

export function useCompositor<U extends Uniforms>(
	gl: WebGL2RenderingContext,
	primaryPass: RenderPass<U>,
	effects: PostEffect[],
) {
	if (effects.length > 0 && primaryPass.target === null) {
		primaryPass.setTarget(createRenderTarget(gl));
	}

	for (const [index, effect] of effects.entries()) {
		effect.initialize(gl);
		effect.setTarget(index === effects.length - 1 ? null : createRenderTarget(gl));

		const textureUniformName =
			findUniformName(effect.fragment, "image") ||
			findUniformName(effect.fragment, "texture") ||
			findUniformName(effect.fragment, "pass");

		if (textureUniformName && effect.uniforms[textureUniformName] === undefined) {
			/* @ts-expect-error the texture uniform is not declared in the uniforms object of the effect pass */
			effect.uniforms[textureUniformName] = () =>
				(index > 0 ? effects[index - 1] : primaryPass).target?.texture;
		}
	}

	const allPasses = [primaryPass, ...effects];

	function render() {
		for (const pass of allPasses) {
			pass.render();
		}
	}

	function setSize(size: { width: number; height: number }) {
		for (const pass of allPasses) {
			pass.setSize(size);
		}
	}

	return { render, setSize, allPasses };
}
