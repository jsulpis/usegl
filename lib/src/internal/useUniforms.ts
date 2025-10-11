import type { DataTextureParams, ImageTextureParams } from "../core/texture";
import { fillTexture } from "../core/texture";
import type { Uniforms, UniformValue, UpdatedCallback } from "../types";
import { useHook } from "./useHook";

export function useUniforms<U extends Uniforms>(uniforms: U) {
  type UniformName = Extract<keyof U, string>;

  let textureUnitIndex = 0;
  const textureUnits = new Map<UniformName, { index: number; texture?: WebGLTexture | null }>();

  let _gl: WebGL2RenderingContext;
  let _program: WebGLProgram;

  const [onUpdated, executeUpdateCallbacks] = useHook<UpdatedCallback<U>>();

  const uniformsLocations = new Map<UniformName, WebGLUniformLocation>();

  function initialize(gl: WebGL2RenderingContext, program: WebGLProgram) {
    _gl = gl;
    _program = program;

    const uniformsCount = _gl.getProgramParameter(_program, _gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformsCount; i++) {
      const uniformName = _gl.getActiveUniform(_program, i)?.name as UniformName;
      uniformsLocations.set(uniformName, _gl.getUniformLocation(_program, uniformName) ?? -1);
    }
  }

  const uniformsProxy = new Proxy(
    { ...uniforms },
    {
      set(target, uniform: string, value) {
        if (value !== target[uniform]) {
          const oldTarget = getSnapshot(target);
          target[uniform as keyof U] = value;
          const newTarget = getSnapshot(target);
          executeUpdateCallbacks(newTarget, oldTarget);
        }
        return true;
      },
    },
  );

  function setUniforms() {
    for (const [uniformName, uniformValue] of Object.entries(uniformsProxy)) {
      setUniform(
        uniformName as UniformName,
        (typeof uniformValue === "function" ? uniformValue() : uniformValue) as U[UniformName],
      );
    }
  }

  function setUniform<Uname extends UniformName>(name: Uname, value: U[Uname] & UniformValue) {
    const uniformLocation = uniformsLocations.get(name) || -1;
    if (uniformLocation === -1) return -1;

    if (typeof value === "number") return _gl.uniform1f(uniformLocation, value);
    if (typeof value === "boolean") return _gl.uniform1i(uniformLocation, value ? 1 : 0);

    if (value instanceof WebGLTexture) {
      if (!textureUnits.has(name)) {
        textureUnits.set(name, { index: textureUnitIndex++ });
      }
      const { index } = textureUnits.get(name)!;
      _gl.activeTexture(_gl.TEXTURE0 + index);
      _gl.bindTexture(_gl.TEXTURE_2D, value);

      return _gl.uniform1i(uniformLocation, index);
    }

    if (Array.isArray(value)) {
      switch (value.length) {
        case 2: {
          return _gl.uniform2fv(uniformLocation, value);
        }
        case 3: {
          return _gl.uniform3fv(uniformLocation, value);
        }
        case 4: {
          return _gl.uniform4fv(uniformLocation, value);
        }
      }
    }

    if ((value as ImageTextureParams).src || (value as DataTextureParams).data) {
      if (!textureUnits.has(name)) {
        const texture = _gl.createTexture();
        textureUnits.set(name, { index: textureUnitIndex++, texture });
      }
      const { index, texture } = textureUnits.get(name)!;
      _gl.activeTexture(_gl.TEXTURE0 + index);
      fillTexture(_gl, texture!, value);

      return _gl.uniform1i(uniformLocation, index);
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
