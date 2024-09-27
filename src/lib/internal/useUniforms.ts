import type { Uniforms as UniformsType, UpdatedCallback } from "../types";
import { useLifeCycleCallback } from "./useLifeCycleCallback";

export function useUniforms<Uniforms extends UniformsType>(uniforms: Uniforms) {
	type UniformName = Extract<keyof Uniforms, string>;

	let _gl: WebGL2RenderingContext;
	let _program: WebGLProgram;

	const [onUpdatedCallbacks, onUpdated] = useLifeCycleCallback<UpdatedCallback<Uniforms>>();

	const uniformsLocations = new Map<UniformName, WebGLUniformLocation>();

	function initialize(gl: WebGL2RenderingContext, program: WebGLProgram) {
		_gl = gl;
		_program = program;

		const uniformsCount = _gl.getProgramParameter(_program, _gl.ACTIVE_UNIFORMS);
		for (let i = 0; i < uniformsCount; i++) {
			const uniformName = _gl.getActiveUniform(_program, i)?.name;
			uniformsLocations.set(
				uniformName as UniformName,
				_gl.getUniformLocation(_program, uniformName)
			);
		}
	}

	const uniformsProxy = new Proxy(
		{ ...uniforms },
		{
			set(target, uniform, value) {
				if (value !== target[uniform]) {
					const oldTarget = getSnapshot(target);
					target[uniform] = value;
					const newTarget = getSnapshot(target);
					onUpdatedCallbacks.forEach((callback) => callback(newTarget, oldTarget));
				}
				return true;
			},
		}
	);

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

	function getUniformsSnapshot() {
		return getSnapshot({ ...uniformsProxy });
	}

	return {
		initialize,
		uniformsProxy,
		onUpdated,
		setUniforms,
		getUniformsSnapshot,
	};
}

function getSnapshot<Obj extends Record<string, unknown>>(object: Obj): Obj {
	return Object.freeze({ ...object });
}
