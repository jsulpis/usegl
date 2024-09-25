import type { Uniforms as UniformsType } from "../types";
import { useRenderPass, type RenderPassOptions } from "./useRenderPass";
import { quadVertexPositions, quadVertexShaderSource } from "../helpers/quad";
import { findAttributeName, findVaryingName } from "../utils/findName";

export function useQuadRenderPass<Uniforms extends UniformsType>(
	gl: WebGL2RenderingContext,
	{ attributes = {}, fragment, vertex, ...renderPassOptions }: RenderPassOptions<Uniforms>
) {
	const uvVaryingName = findVaryingName(fragment, "uv");

	const vertexShader =
		vertex ||
		(uvVaryingName
			? quadVertexShaderSource.replace(/\bvUv\b/g, uvVaryingName)
			: quadVertexShaderSource);

	const hasPositionAttribute = Object.keys(attributes).some((attributeName) =>
		attributeName.toLocaleLowerCase().endsWith("position")
	);

	if (!hasPositionAttribute) {
		const positionAttributeName = findAttributeName(vertex, "position") || "aPosition";

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
