import type {
	Attribute,
	DrawMode,
	RenderCallback,
	RenderPass,
	RenderTarget,
	Uniforms as UniformsType,
} from "../types";
import { createProgram } from "../core/program";
import { setRenderTarget } from "../core/renderTarget";
import { findUniformName } from "../internal/findName";
import { useUniforms } from "../internal/useUniforms";
import { useAttributes } from "../internal/useAttributes";
import { useLifeCycleCallback } from "../internal/useLifeCycleCallback";

export type RenderPassOptions<Uniforms extends UniformsType = Record<string, never>> = {
	target?: RenderTarget | null;
	fragment: string;
	vertex: string;
	attributes?: Record<string, Attribute>;
	uniforms?: Uniforms;
	drawMode?: DrawMode;
};

export function useRenderPass<Uniforms extends UniformsType>(
	gl: WebGL2RenderingContext | undefined,
	{
		target = null,
		fragment,
		vertex,
		attributes = {},
		uniforms: userUniforms = {} as Uniforms,
		drawMode: userDrawMode,
	}: RenderPassOptions<Uniforms>,
): RenderPass<Uniforms> {
	/**
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

	function initialize(gl: WebGL2RenderingContext) {
		_gl = gl;
		const program = createProgram(_gl, fragment, vertex);
		if (program == null) {
			throw new Error("could not initialize the render pass");
		}
		_program = program;
		_gl.useProgram(_program);

		initializeUniforms(_gl, _program);
		initializeAttributes(_gl, _program);
	}

	if (gl) {
		initialize(gl);
	}

	/**
	 * UPDATE
	 */

	const resolutionUniformName = findUniformName(fragment + vertex, "resolution");

	function setSize(size: { width: number; height: number }) {
		if (resolutionUniformName && userUniforms[resolutionUniformName] === undefined) {
			(uniformsProxy as Record<string, unknown>)[resolutionUniformName] = [size.width, size.height];
		}
		if (_target != null) {
			_target.setSize(size.width, size.height);
		}
	}

	function setTarget(target: RenderTarget | null) {
		_target = target;
	}

	/**
	 * RENDER
	 */

	const drawMode = userDrawMode || (vertex.includes("gl_PointSize") ? "POINTS" : "TRIANGLES");

	const [beforeRenderCallbacks, onBeforeRender] = useLifeCycleCallback<RenderCallback<Uniforms>>();
	const [afterRenderCallbacks, onAfterRender] = useLifeCycleCallback<RenderCallback<Uniforms>>();

	function render() {
		if (_gl == undefined) {
			throw new Error("The render pass must be initialized before calling the render function");
		}
		for (const callback of beforeRenderCallbacks) {
			callback({ uniforms: getUniformsSnapshot() });
		}

		setRenderTarget(_gl, _target);
		_gl.useProgram(_program);

		bindVAO();
		setUniforms();

		if (hasIndices) {
			_gl.drawElements(_gl[drawMode], getVertexCount(), indexType, 0);
		} else {
			_gl.drawArrays(_gl[drawMode], 0, getVertexCount());
		}

		for (const callback of afterRenderCallbacks) {
			callback({ uniforms: getUniformsSnapshot() });
		}
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
