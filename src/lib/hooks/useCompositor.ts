import { createRenderTarget } from "../core/renderTarget";
import type { PostEffect, RenderPass } from "../types";
import { findUniformName } from "../utils/findName";

export function useCompositor(
	gl: WebGL2RenderingContext,
	primaryPass: RenderPass,
	effects: PostEffect[]
) {
	if (effects.length > 0 && primaryPass.target === null) {
		primaryPass.setTarget(createRenderTarget(gl));
	}

	effects.forEach((effect, index) => {
		effect.initialize(gl);
		effect.setTarget(index === effects.length - 1 ? null : createRenderTarget(gl));

		const textureUniformName =
			findUniformName(effect.fragment, "image") ||
			findUniformName(effect.fragment, "texture") ||
			findUniformName(effect.fragment, "pass");

		if (textureUniformName && effect.uniforms[textureUniformName] === undefined) {
			effect.uniforms[textureUniformName] = () =>
				(index > 0 ? effects[index - 1] : primaryPass).target.texture;
		}
	});

	const allPasses = [primaryPass, ...effects];

	function render() {
		allPasses.forEach((pass) => {
			pass.render();
		});
	}

	function setSize(size: { width: number; height: number }) {
		allPasses.forEach((pass) => {
			pass.setSize(size);
		});
	}

	return { render, setSize, allPasses };
}
