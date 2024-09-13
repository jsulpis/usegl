import { createProgram } from "../core/program";
import { useWebGLContext } from "./useWebGLContext";
import { setAttribute } from "../core/attribute";
import type { Attribute, Uniforms } from "../types";

export interface WebGLCanvasProps<U extends Uniforms> {
	canvas: HTMLCanvasElement | OffscreenCanvas;
	fragment: string;
	vertex?: string;
	uniforms?: U;
	attributes?: Record<string, Attribute>;
	webglContextOptions?: WebGLContextAttributes;
	dpr?: number;
}

export const useRawWebGLCanvas = <UniformsObj extends Uniforms>({
	canvas,
	fragment,
	vertex,
	uniforms = {} as UniformsObj,
	attributes,
	webglContextOptions,
	dpr = window.devicePixelRatio,
}: WebGLCanvasProps<UniformsObj>) => {
	type UniformName = Extract<keyof UniformsObj, string>;

	const { gl, setSize } = useWebGLContext(canvas, webglContextOptions);
	if (!gl) return { setSize: () => {} };

	const program = createProgram(gl, fragment, vertex);
	gl.useProgram(program);

	let maxVertexCount = 0;

	Object.entries(attributes || {}).forEach(([attributeName, attributeObj]) => {
		const { vertexCount } = setAttribute(gl, program, attributeName, attributeObj);
		maxVertexCount = Math.max(maxVertexCount, vertexCount);
	});

	const uniformsLocations = new Map(
		Object.keys(uniforms).map((uniformName) => [
			uniformName,
			gl.getUniformLocation(program, uniformName),
		])
	);

	const uniformsProxy = new Proxy(uniforms, {
		set(target, prop: UniformName, value) {
			const result = setUniform(prop, value);
			Object.assign(target, { [prop]: value });
			return result !== -1;
		},
	});

	Object.entries(uniforms).forEach(([uniformName, uniformValue]) => {
		setUniform(uniformName as UniformName, uniformValue as UniformsObj[UniformName]);
	});

	function setUniform<U extends UniformName>(uniform: U, value: UniformsObj[U]) {
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

	function render() {
		gl.drawArrays(gl.TRIANGLES, 0, maxVertexCount);
	}

	return { canvas, gl, render, setSize, dpr, setUniform, uniforms: uniformsProxy };
};
