import { createProgram } from "../core/program";
import { onCanvasResize } from "../helpers/resize";
import { quadVertexPositions, quadVertexShaderSource } from "../helpers/quad";
import { useWebGLContext } from "./useWebGLContext";
import { setAttribute, type AttributeObj } from "../core/attribute";

type VectorUniform = [number, number] | [number, number, number] | [number, number, number, number];
type UniformValue = number | VectorUniform;
type UniformsObj = Record<string, UniformValue> | {};

interface WebGLCanvasProps<Uniforms extends UniformsObj> {
	canvas: HTMLCanvasElement | OffscreenCanvas;
	fragment: string;
	vertex?: string;
	uniforms?: Uniforms;
	attributes?: Record<string, AttributeObj>;
	webglContextOptions?: WebGLContextAttributes;
}

export const useWebGLCanvas = <Uniforms extends UniformsObj>(props: WebGLCanvasProps<Uniforms>) => {
	const { canvas, fragment, vertex, uniforms, webglContextOptions } = props;
	type UniformName = Extract<keyof Uniforms, string>;

	const { gl, setSize: setCanvasSize } = useWebGLContext(canvas, webglContextOptions);
	if (!gl) return { setSize: () => {} };

	const timeUniformName = findName(fragment, "uniform", "time");
	const resolutionUniformName = findName(fragment, "uniform", "resolution");
	const uvVaryingName = findName(fragment, "varying", "uv") || findName(fragment, "in", "uv");

	const vertexShader =
		vertex ||
		(uvVaryingName
			? quadVertexShaderSource.replace(/\bvUv\b/g, uvVaryingName)
			: quadVertexShaderSource);

	const program = createProgram(gl, fragment, vertexShader);
	gl.useProgram(program);

	let maxVertexCount = 0;
	let hasProvidedPositionAttribute = false;

	Object.entries(props.attributes || {}).forEach(([attributeName, attributeObj]) => {
		const { vertexCount } = setAttribute(gl, program, attributeName, attributeObj);
		maxVertexCount = Math.max(maxVertexCount, vertexCount);

		if (attributeName.toLocaleLowerCase().endsWith("position")) {
			hasProvidedPositionAttribute = true;
		}
	});

	if (!hasProvidedPositionAttribute) {
		const positionAttributeName =
			findName(vertex, "attribute", "position") ||
			findName(vertex, "in", "position") ||
			"aPosition";

		setAttribute(gl, program, positionAttributeName, {
			size: 2,
			data: quadVertexPositions,
		});
		maxVertexCount = 6;
	}

	const timeUniformLocation = gl.getUniformLocation(program, timeUniformName);
	const resolutionUniformLocation = gl.getUniformLocation(program, resolutionUniformName);

	function render() {
		gl.drawArrays(gl.TRIANGLES, 0, maxVertexCount);
	}

	function setSize({ width, height }: { width: number; height: number }) {
		setCanvasSize(width, height);

		if (resolutionUniformName) {
			gl.uniform2f(resolutionUniformLocation, width, height);
		}
		if (!timeUniformName) {
			render();
		}
	}

	if (timeUniformName) {
		requestAnimationFrame(function renderLoop(time) {
			requestAnimationFrame(renderLoop);
			gl.uniform1f(timeUniformLocation, time / 500);
			render();
		});
	}

	if (!(canvas instanceof OffscreenCanvas)) {
		onCanvasResize(canvas, ({ devicePixelSize }) => {
			setSize(devicePixelSize);
		});
	}

	const uniformsLocations =
		uniforms != undefined
			? new Map(
					Object.keys(uniforms).map((uniformName) => [
						uniformName,
						gl.getUniformLocation(program, uniformName),
					])
			  )
			: new Map();

	const uniformsProxy =
		uniforms != undefined
			? new Proxy(uniforms, {
					set(target, prop: UniformName, value) {
						const result = setUniform(prop, value);
						Object.assign(target, { [prop]: value });
						return result !== -1;
					},
			  })
			: uniforms;

	function setUniform<U extends UniformName>(uniform: U, value: Uniforms[U]): void | -1 {
		const uniformLocation = uniformsLocations.get(uniform);
		if (uniformLocation === -1) return -1;

		if (typeof value === "number") return gl.uniform1f(uniformLocation, value);

		if (Array.isArray(value)) {
			switch (value.length) {
				case 2:
					return gl.uniform2fv(uniformLocation, value);
				case 3:
					return gl.uniform3fv(uniformLocation, value);
				case 4:
					return gl.uniform4fv(uniformLocation, value);
			}
		}
	}

	return { canvas, setSize, setUniform, uniforms: uniformsProxy, gl };
};

function findName(source: string, keyword: string, word: string) {
	return source
		?.split("\n")
		.find((line) => new RegExp(`^${keyword}.*${word};`, "i").test(line.trim()))
		?.match(/(\w+);$/)[1];
}
