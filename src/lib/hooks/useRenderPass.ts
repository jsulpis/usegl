import type {
	Attribute,
	DrawMode,
	RenderPass,
	RenderTarget,
	Uniforms as UniformsType,
} from "../types";
import { setAttribute } from "../core/attribute";
import { createProgram } from "../core/program";
import { setRenderTarget } from "../core/renderTarget";
import { findUniformName } from "../utils/findName";

export type RenderPassOptions<Uniforms extends UniformsType = {}> = {
	target?: RenderTarget | null;
	fragment: string;
	vertex?: string;
	attributes?: Record<string, Attribute>;
	uniforms?: Uniforms;
	drawMode?: DrawMode;
};

export function useRenderPass<Uniforms extends UniformsType>(
	gl: WebGL2RenderingContext,
	{
		target = null,
		fragment,
		vertex,
		attributes = {},
		uniforms = {} as Uniforms,
		drawMode,
	}: RenderPassOptions<Uniforms>
): RenderPass<Uniforms> {
	type UniformName = Extract<keyof Uniforms, string>;

	let _target = target;

	const program = createProgram(gl, fragment, vertex);
	gl.useProgram(program);

	const vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

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

	const liveUniforms = { ...uniforms };

	let textureUnitIndex = 0;
	const textureUnits = new Map<UniformName, number>();

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

	const resolutionUniformName = findUniformName(fragment + vertex, "resolution");

	function setSize(size: { width: number; height: number }) {
		if (resolutionUniformName && uniforms[resolutionUniformName] === undefined) {
			liveUniforms[resolutionUniformName] = [size.width, size.height];
		}
		if (_target != null) {
			_target.setSize(size.width, size.height);
		}
	}

	function setTarget(target: RenderTarget | null) {
		_target = target;
	}

	const hasIndices = attributes.index != undefined;
	const indexType = attributes.index?.data.length < 65536 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT;
	const finalDrawMode = drawMode || (vertex.includes("gl_PointSize") ? "POINTS" : "TRIANGLES");

	function render() {
		setRenderTarget(gl, _target);
		gl.useProgram(program);
		gl.bindVertexArray(vao);
		setUniforms();

		if (hasIndices) {
			gl.drawElements(gl[finalDrawMode], vertexCount, indexType, 0);
		} else {
			gl.drawArrays(gl[finalDrawMode], 0, vertexCount);
		}
	}

	return {
		render,
		get target() {
			return _target;
		},
		setTarget,
		setSize,
		uniforms: liveUniforms,
		vertex,
		fragment,
	};
}
