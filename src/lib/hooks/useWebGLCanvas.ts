import { onCanvasResize } from "../helpers/resize";
import { quadVertexPositions, quadVertexShaderSource } from "../helpers/quad";
import { loop } from "../helpers/loop";
import type { Uniforms as UniformsType } from "../types";
import { useRawWebGLCanvas, type WebGLCanvasProps } from "./useRawWebGLCanvas";

interface Props<U extends UniformsType> extends WebGLCanvasProps<U> {
	dpr?: number;
}

export const useWebGLCanvas = <Uniforms extends UniformsType>(props: Props<Uniforms>) => {
	const { canvas, fragment, dpr = window.devicePixelRatio } = props;

	const timeUniformName = findName(fragment, "uniform", "time");
	const resolutionUniformName = findName(fragment, "uniform", "resolution");

	const glCanvas = useRawWebGLCanvas({ ...props, ...getDefaultProps(props) });
	const { gl, requestRender, uniforms, setSize: setCanvasSize } = glCanvas;

	if (!gl) return { setSize: () => {} };

	const uniformsProxy = new Proxy(uniforms, {
		set(target, uniform, value) {
			target[uniform] = value;
			requestRender();
			return true;
		},
	});

	function setSize({ width, height }: { width: number; height: number }) {
		setCanvasSize(width, height);
		if (resolutionUniformName) {
			uniformsProxy[resolutionUniformName] = [width, height];
		}
	}

	if (timeUniformName) {
		loop(({ time }) => {
			uniformsProxy[timeUniformName] = time / 500;
		});
	}

	if (canvas instanceof HTMLCanvasElement) {
		// Don't listen for resize on an OffscreenCanvas (possibly in a worker)
		onCanvasResize(canvas, ({ size }) => {
			setSize({ width: size.width * dpr, height: size.height * dpr });
		});
	}

	return { ...glCanvas, setSize, dpr, uniforms: uniformsProxy };
};

/**
 * Find relevant default values for missing properties.
 */
function getDefaultProps({ fragment, vertex, attributes = {} }: WebGLCanvasProps) {
	const uvVaryingName = findName(fragment, "varying", "uv") || findName(fragment, "in", "uv");

	const vertexShader =
		vertex || uvVaryingName
			? quadVertexShaderSource.replace(/\bvUv\b/g, uvVaryingName)
			: quadVertexShaderSource;

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

	return { vertex: vertexShader, attributes };
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
