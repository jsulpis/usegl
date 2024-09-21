import type { Uniforms as UniformsType } from "../types";
import { useRenderPass, type RenderPassOptions } from "./useRenderPass";
import { quadVertexPositions, quadVertexShaderSource } from "../helpers/quad";

export function useQuadRenderPass<Uniforms extends UniformsType>(
	gl: WebGL2RenderingContext,
	{ attributes = {}, fragment, vertex, ...renderPassOptions }: RenderPassOptions<Uniforms>
) {
	const uvVaryingName = findName(fragment, "varying", "uv") || findName(fragment, "in", "uv");

	const vertexShader =
		vertex ||
		(uvVaryingName
			? quadVertexShaderSource.replace(/\bvUv\b/g, uvVaryingName)
			: quadVertexShaderSource);

	const hasPositionAttribute = Object.keys(attributes).some((attributeName) =>
		attributeName.toLocaleLowerCase().endsWith("position")
	);

	if (!hasPositionAttribute) {
		const positionAttributeName =
			findName(vertex, "attribute", "position") ||
			findName(vertex, "in", "position") ||
			"aPosition";

		attributes[positionAttributeName] = {
			size: 2,
			data: quadVertexPositions,
		};
	}

	return useRenderPass(gl, {
		...renderPassOptions,
		attributes,
		fragment,
		vertex: vertexShader,
	});
}

/**
 * Find the name of an attribute, uniform or varying in a shader source.
 */
function findName(source: string, keyword: string, word: string) {
	return source
		?.split("\n")
		.find((line) => new RegExp(`^${keyword}.*${word};`, "i").test(line.trim()))
		?.match(/(\w+);$/)[1];
}
