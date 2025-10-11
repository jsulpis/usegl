import type {
  Attribute,
  DrawMode,
  RenderCallback,
  RenderPass,
  RenderTarget,
  Uniforms,
} from "../types";
import { createProgram } from "../core/program";
import { setRenderTarget } from "../core/renderTarget";
import { findUniformName } from "../internal/findName";
import { useUniforms } from "../internal/useUniforms";
import { useAttributes } from "../internal/useAttributes";
import { useHook } from "../internal/useHook";

export type RenderPassOptions<U extends Uniforms = Record<string, never>> = {
  target?: RenderTarget | null;
  fragment: string;
  vertex: string;
  attributes?: Record<string, Attribute>;
  uniforms?: U;
  transparent?: boolean;
  drawMode?: DrawMode;
  transformFeedbackVaryings?: string[];
  resolutionScale?: number;
};

export function useRenderPass<U extends Uniforms>(
  gl: WebGL2RenderingContext | undefined,
  {
    target = null,
    fragment,
    vertex,
    attributes = {},
    uniforms: userUniforms = {} as U,
    transparent = false,
    drawMode: userDrawMode,
    transformFeedbackVaryings,
    resolutionScale = 1,
  }: RenderPassOptions<U>,
): RenderPass<U> {
  /*
   * INIT
   */

  let _target = target;
  let _program: WebGLProgram;
  let _gl: WebGL2RenderingContext;

  const {
    initialize: initializeUniforms,
    onUpdated,
    setUniforms,
    getUniformsSnapshot,
    uniformsProxy,
  } = useUniforms(userUniforms);
  const {
    initialize: initializeAttributes,
    getVertexCount,
    bindVAO,
    hasIndices,
    indexType,
  } = useAttributes(attributes);

  const [onInit, executeInitCallbacks] = useHook<(gl: WebGL2RenderingContext) => void>();

  function initialize(gl: WebGL2RenderingContext) {
    _gl = gl;
    const program = createProgram(_gl, fragment, vertex, transformFeedbackVaryings);
    if (program == null) {
      throw new Error("could not initialize the render pass");
    }
    _program = program;
    _gl.useProgram(_program);

    initializeUniforms(_gl, _program);
    initializeAttributes(_gl, _program);

    executeInitCallbacks(_gl);
  }

  if (gl) {
    initialize(gl);
  }

  /*
   * UPDATE
   */

  const resolutionUniformName = findUniformName(fragment + vertex, "resolution");

  const [onResize, executeResizeCallbacks] = useHook<(width: number, height: number) => void>();

  function setSize(size: { width: number; height: number }) {
    const width = size.width * resolutionScale;
    const height = size.height * resolutionScale;

    if (resolutionUniformName && userUniforms[resolutionUniformName] === undefined) {
      (uniformsProxy as Record<string, unknown>)[resolutionUniformName] = [width, height];
    }
    if (_target != null) {
      _target.setSize(width, height);
    }
    executeResizeCallbacks(width, height);
  }

  function setTarget(target: RenderTarget | null) {
    _target = target;
  }

  /*
   * RENDER
   */

  const drawMode = userDrawMode || (vertex.includes("gl_PointSize") ? "POINTS" : "TRIANGLES");

  const [onBeforeRender, executeBeforeRenderCallbacks] = useHook<RenderCallback<U>>();
  const [onAfterRender, executeAfterRenderCallbacks] = useHook<RenderCallback<U>>();

  function render({ target }: { target?: RenderTarget | null } = {}) {
    if (_gl == undefined) {
      throw new Error("The render pass must be initialized before calling the render function");
    }

    setRenderTarget(_gl, target ?? _target);
    _gl.useProgram(_program);

    if (transparent) {
      _gl.enable(_gl.BLEND);
      _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);
    } else {
      _gl.disable(_gl.BLEND);
    }

    bindVAO();
    setUniforms();

    executeBeforeRenderCallbacks({ uniforms: getUniformsSnapshot() });

    if (hasIndices) {
      _gl.drawElements(_gl[drawMode], getVertexCount(), indexType, 0);
    } else {
      _gl.drawArrays(_gl[drawMode], 0, getVertexCount());
    }

    executeAfterRenderCallbacks({ uniforms: getUniformsSnapshot() });
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
    onInit,
    onResize,
  };
}
