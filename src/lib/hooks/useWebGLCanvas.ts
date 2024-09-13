import { createProgram } from "../core/program";
import { onCanvasResize } from "../helpers/resize";
import { quadVertexPositions, quadVertexShaderSource } from "../helpers/quad";
import { useWebGLContext } from "./useWebGLContext";
import { setAttribute } from "../core/attribute";
import { loop } from "../helpers/loop";
import type { Uniforms } from "../types";
import type { WebGLCanvasProps } from "./useRawWebGLCanvas";
import { convertToGLSL300 } from "../core/shader";

export const useWebGLCanvas = <UniformsObj extends Uniforms>({
	canvas,
	fragment,
	vertex,
	uniforms = {} as UniformsObj,
	attributes = {},
	webglContextOptions,
	dpr = window.devicePixelRatio,
}: WebGLCanvasProps<UniformsObj>) => {
	type UniformName = Extract<keyof UniformsObj, string>;

	const { gl, setSize: setCanvasSize } = useWebGLContext(canvas, webglContextOptions);
	if (!gl) return { setSize: () => {} };

	const fragmentShader = convertToGLSL300(fragment);

	const timeUniformName = findName(fragmentShader, "uniform", "time");
	const resolutionUniformName = findName(fragmentShader, "uniform", "resolution");
	const uvVaryingName = findName(fragmentShader, "in", "uv");

	const vertexShader = vertex
		? convertToGLSL300(vertex)
		: uvVaryingName
		? quadVertexShaderSource.replace(/\bvUv\b/g, uvVaryingName)
		: quadVertexShaderSource;

	const program = createProgram(gl, fragmentShader, vertexShader);
	gl.useProgram(program);

	let maxVertexCount = 0;
	let hasProvidedPositionAttribute = false;

	Object.entries(attributes).forEach(([attributeName, attributeObj]) => {
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

	const uniformsLocations = new Map(
		Object.keys(uniforms)
			.concat(resolutionUniformName, timeUniformName)
			.map((uniformName) => [uniformName, gl.getUniformLocation(program, uniformName)])
	);

	const uniformsProxy = new Proxy(uniforms, {
		set(target, prop: UniformName, value) {
			const result = setUniform(prop, value);
			Object.assign(target, { [prop]: value });
			return result !== -1;
		},
	});

	let renderHandle: number | null = null;

	function render() {
		gl.drawArrays(gl.TRIANGLES, 0, maxVertexCount);
	}

	function setSize({ width, height }: { width: number; height: number }) {
		setCanvasSize(width, height);

		if (resolutionUniformName) {
			// @ts-expect-error the resolution uniform is not registered in the Uniforms type
			setUniform(resolutionUniformName, [width, height]);
		}
	}

	if (timeUniformName) {
		loop(({ time }) => {
			// @ts-expect-error the time uniform is not registered in the Uniforms type
			setUniform(timeUniformName, time / 500);
		});
	}

	if (!(canvas instanceof OffscreenCanvas)) {
		onCanvasResize(canvas, ({ size }) => {
			setSize({ width: size.width * dpr, height: size.height * dpr });
		});
	}

	Object.entries(uniforms).forEach(([uniformName, uniformValue]) => {
		setUniform(uniformName as UniformName, uniformValue as UniformsObj[UniformName], false);
	});

	function setUniform<U extends UniformName>(
		uniform: U,
		value: UniformsObj[U],
		triggerRender = true
	) {
		const uniformLocation = uniformsLocations.get(uniform);
		if (uniformLocation === -1) return -1;

		if (renderHandle == null && triggerRender) {
			renderHandle = requestAnimationFrame(() => {
				render();
				renderHandle = null;
			});
		}

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

	return { canvas, render, setSize, dpr, setUniform, uniforms: uniformsProxy, gl };
};

function findName(source: string, keyword: string, word: string) {
	return source
		?.split("\n")
		.find((line) => new RegExp(`^${keyword}.*${word};`, "i").test(line.trim()))
		?.match(/(\w+);$/)[1];
}
