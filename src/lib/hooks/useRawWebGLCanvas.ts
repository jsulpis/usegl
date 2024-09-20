import { createProgram } from "../core/program";
import { useWebGLContext } from "./useWebGLContext";
import { setAttribute } from "../core/attribute";
import type { Attribute, Uniforms } from "../types";

type DrawMode =
	| "POINTS"
	| "LINES"
	| "LINE_STRIP"
	| "LINE_LOOP"
	| "TRIANGLES"
	| "TRIANGLE_STRIP"
	| "TRIANGLE_FAN";

export interface WebGLCanvasProps<U extends Uniforms = {}> {
	canvas: HTMLCanvasElement | OffscreenCanvas;
	fragment: string;
	vertex?: string;
	uniforms?: U;
	attributes?: Record<string, Attribute>;
	webglOptions?: WebGLContextAttributes;
	drawMode?: DrawMode;
}

export const useRawWebGLCanvas = <UniformsObj extends Uniforms>({
	canvas,
	fragment,
	vertex,
	uniforms = {} as UniformsObj,
	attributes = {},
	webglOptions,
	drawMode,
}: WebGLCanvasProps<UniformsObj>) => {
	type UniformName = Extract<keyof UniformsObj, string>;

	const { gl, setSize } = useWebGLContext(canvas, webglOptions);

	const program = createProgram(gl, fragment, vertex);
	gl.useProgram(program);

	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	let vertexCount = 0;

	Object.entries(attributes).forEach(([attributeName, attributeObj]) => {
		const attr = setAttribute(gl, program, attributeName, attributeObj);
		vertexCount = Math.max(vertexCount, attr.vertexCount);
	});

	const uniformsLocations = new Map<UniformName, WebGLUniformLocation>();
	const uniformsCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for (let i = 0; i < uniformsCount; i++) {
		const uniformName = gl.getActiveUniform(program, i)?.name;
		uniformsLocations.set(uniformName as UniformName, gl.getUniformLocation(program, uniformName));
	}

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

	const hasIndices = attributes.index != undefined;
	const indexType = attributes.index?.data.length < 65536 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
	const finalDrawMode = drawMode || (vertex.includes("gl_PointSize") ? "POINTS" : "TRIANGLES");

	function render() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		if (hasIndices) {
			gl.drawElements(gl[finalDrawMode], vertexCount, indexType, 0);
		} else {
			gl.drawArrays(gl[finalDrawMode], 0, vertexCount);
		}
	}

	let requestedRender = false;

	/**
	 * Request a render to be executed on the next animation frame.
	 * If this function is called multiple times before the next animation frame,
	 * the render will only be executed once.
	 */
	function requestRender() {
		if (requestedRender) return;
		requestedRender = true;

		requestAnimationFrame(() => {
			requestedRender = false;
			render();
		});
	}

	return { canvas, gl, render, requestRender, setSize, uniforms: uniformsProxy };
};
