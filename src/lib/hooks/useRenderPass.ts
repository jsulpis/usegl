import type {
	Attribute,
	DrawMode,
	RenderCallback,
	RenderPass,
	RenderTarget,
	Uniforms as UniformsType,
	UpdatedCallback,
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
	let _program: WebGLProgram;
	let _vao: WebGLVertexArrayObject;
	let _gl: WebGL2RenderingContext;

	let vertexCount = 0;
	const uniformsLocations = new Map<UniformName, WebGLUniformLocation>();

	if (gl) {
		initialize(gl);
	}

	function initialize(gl: WebGL2RenderingContext) {
		_gl = gl;
		_program = createProgram(_gl, fragment, vertex);
		_gl.useProgram(_program);

		_vao = _gl.createVertexArray();
		_gl.bindVertexArray(_vao);

		Object.entries(attributes).forEach(([attributeName, attributeObj]) => {
			const attr = setAttribute(_gl, _program, attributeName, attributeObj);
			vertexCount = Math.max(vertexCount, attr.vertexCount);
		});

		const uniformsCount = _gl.getProgramParameter(_program, _gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < uniformsCount; i++) {
			const uniformName = _gl.getActiveUniform(_program, i)?.name;
			uniformsLocations.set(
				uniformName as UniformName,
				_gl.getUniformLocation(_program, uniformName)
			);
		}
	}

	const uniformsProxy = new Proxy(uniforms, {
		set(target, uniform, value) {
			if (value !== target[uniform]) {
				const oldTarget = getSnapshot(target);
				target[uniform] = value;
				const newTarget = getSnapshot(target);
				onUpdatedCallbacks.forEach((callback) => callback(newTarget, oldTarget));
			}
			return true;
		},
	});

	let textureUnitIndex = 0;
	const textureUnits = new Map<UniformName, number>();

	function setUniforms() {
		Object.entries(uniformsProxy).forEach(([uniformName, uniformValue]) => {
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

		if (typeof value === "number") return _gl.uniform1f(uniformLocation, value);

		if (value instanceof WebGLTexture) {
			if (!textureUnits.has(name)) {
				textureUnits.set(name, textureUnitIndex++);
			}
			_gl.activeTexture(_gl.TEXTURE0 + textureUnits.get(name));
			_gl.bindTexture(_gl.TEXTURE_2D, value);

			return _gl.uniform1i(uniformLocation, textureUnits.get(name));
		}

		if (Array.isArray(value)) {
			switch (value.length) {
				case 2:
					return _gl.uniform2fv(uniformLocation, value);
				case 3:
					return _gl.uniform3fv(uniformLocation, value);
				case 4:
					return _gl.uniform4fv(uniformLocation, value);
			}
		}
	}

	const resolutionUniformName = findUniformName(fragment + vertex, "resolution");

	function setSize(size: { width: number; height: number }) {
		if (resolutionUniformName && uniforms[resolutionUniformName] === undefined) {
			uniformsProxy[resolutionUniformName] = [size.width, size.height];
		}
		if (_target != null) {
			_target.setSize(size.width, size.height);
		}
	}

	function setTarget(target: RenderTarget | null) {
		_target = target;
	}

	const hasIndices = attributes.index != undefined;
	const indexType =
		attributes.index?.data.length < 65536
			? WebGL2RenderingContext.UNSIGNED_SHORT
			: WebGL2RenderingContext.UNSIGNED_INT;
	const finalDrawMode = drawMode || (vertex.includes("gl_PointSize") ? "POINTS" : "TRIANGLES");

	const beforeRenderCallbacks: RenderCallback<Uniforms>[] = [];
	const afterRenderCallbacks: RenderCallback<Uniforms>[] = [];
	const onUpdatedCallbacks: UpdatedCallback<Uniforms>[] = [];

	function onUpdated(callback: UpdatedCallback<Uniforms>) {
		onUpdatedCallbacks.push(callback);
	}

	function onBeforeRender(callback: RenderCallback<Uniforms>) {
		beforeRenderCallbacks.push(callback);
	}
	function onAfterRender(callback: RenderCallback<Uniforms>) {
		afterRenderCallbacks.push(callback);
	}

	function render() {
		if (_gl == undefined) {
			throw new Error("The render pass must be initialized before calling the render function");
		}
		beforeRenderCallbacks.forEach((callback) => callback({ uniforms: getSnapshot(uniformsProxy) }));

		setRenderTarget(_gl, _target);
		_gl.useProgram(_program);
		_gl.bindVertexArray(_vao);
		setUniforms();

		if (hasIndices) {
			_gl.drawElements(_gl[finalDrawMode], vertexCount, indexType, 0);
		} else {
			_gl.drawArrays(_gl[finalDrawMode], 0, vertexCount);
		}

		afterRenderCallbacks.forEach((callback) => callback({ uniforms: getSnapshot(uniformsProxy) }));
	}

	return {
		render,
		initialize,
		setTarget,
		get target() {
			return _target;
		},
		setSize,
		uniforms: uniformsProxy,
		vertex,
		fragment,
		onUpdated,
		onBeforeRender,
		onAfterRender,
	};
}

function getSnapshot<Obj extends Record<string, unknown>>(object: Obj): Obj {
	return Object.freeze({ ...object });
}
