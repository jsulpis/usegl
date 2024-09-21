import { quadVertexPositions, quadVertexShaderSource } from "../helpers/quad";
import type { Attribute, RenderTarget, Uniforms as UniformsType } from "../types";
import { setAttribute } from "./attribute";
import { createProgram } from "./program";
import { createRenderTarget, setRenderTarget } from "./renderTarget";

export function createRenderPass<Uniforms extends UniformsType>(
	gl: WebGL2RenderingContext,
	{
		fragment,
		vertex,
		attributes,
		uniforms,
		width,
		height,
		target,
		drawMode = gl.TRIANGLES,
	}: {
		fragment: string;
		target?: RenderTarget;
		vertex?: string;
		attributes?: Record<string, Attribute>;
		width?: number;
		height?: number;
		uniforms?: Uniforms;
		drawMode?: GLenum;
	}
) {
	const renderTarget = target !== undefined ? target : createRenderTarget(gl, { width, height });

	const program = createProgram(gl, fragment, vertex || quadVertexShaderSource);

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	let vertexCount = 0;

	if (attributes) {
		for (const [name, attribute] of Object.entries(attributes)) {
			const attr = setAttribute(gl, program, name, attribute);
			vertexCount = Math.max(vertexCount, attr.vertexCount);
		}
	} else {
		// create 2 triangles for the post process quad
		setAttribute(gl, program, "aPosition", {
			size: 2,
			data: quadVertexPositions,
		});
		vertexCount = 6;
	}

	type UniformName = Extract<keyof Uniforms, string>;

	gl.useProgram(program);

	const uniformsLocations = new Map(
		Object.keys(uniforms || {}).map((uniformName) => [
			uniformName,
			gl.getUniformLocation(program, uniformName),
		])
	);

	let textureUnitIndex = 0;
	const textureUnits = new Map<UniformName, number>();

	const liveUniforms: Uniforms = { ...uniforms };

	function setUniforms() {
		Object.entries(liveUniforms).forEach(([uniformName, uniformValue]) => {
			setUniform(
				uniformName as UniformName,
				(typeof uniformValue === "function"
					? uniformValue()
					: uniformValue) as Uniforms[UniformName]
			);
		});
	}
	function updateUniform<U extends UniformName>(name: U, value: Uniforms[U]) {
		liveUniforms[name] = value;
	}

	function setUniform<U extends UniformName>(name: U, value: Uniforms[U]) {
		const uniformLocation = uniformsLocations.get(name);
		if (uniformLocation === -1) return -1;

		if (typeof value === "number") return gl.uniform1f(uniformLocation, value);

		if (value instanceof WebGLTexture) {
			if (!textureUnits.has(name)) {
				textureUnits.set(name, textureUnitIndex++);
			}
			gl.activeTexture(gl.TEXTURE0 + textureUnits.get(name));
			gl.bindTexture(gl.TEXTURE_2D, value);

			return gl.uniform1i(uniformLocation, textureUnits.get(name));
		}

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
		setRenderTarget(gl, renderTarget);
		gl.useProgram(program);
		gl.bindVertexArray(vao);
		setUniforms();
		gl.drawArrays(drawMode, 0, vertexCount);
	}

	return { render, target: renderTarget, updateUniform };
}
