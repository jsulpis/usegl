import { onCanvasResize } from "../helpers/resize";
import { loop } from "../helpers/loop";
import type { Attribute, DrawMode, PostEffect, Uniforms } from "../types";
import { useWebGLContext } from "./useWebGLContext";
import { useQuadRenderPass } from "./useQuadRenderPass";
import { useCompositor } from "./useCompositor";
import { findUniformName } from "../internal/findName";

interface Props<U extends Uniforms> {
	canvas: HTMLCanvasElement | OffscreenCanvas | string;
	fragment: string;
	vertex?: string;
	uniforms?: U;
	attributes?: Record<string, Attribute>;
	webglOptions?: WebGLContextAttributes;
	drawMode?: DrawMode;
	dpr?: number;
	postEffects?: PostEffect[];
}

export const useWebGLCanvas = <U extends Uniforms>(props: Props<U>) => {
	const {
		canvas: canvasProp,
		fragment,
		vertex,
		dpr = window.devicePixelRatio,
		postEffects = [],
	} = props;

	const { gl, canvas, setSize: setCanvasSize } = useWebGLContext(canvasProp);

	const primaryPass = useQuadRenderPass(gl, props);
	const compositor = useCompositor(gl, primaryPass, postEffects);

	for (const pass of compositor.allPasses) {
		pass.onUpdated(requestRender);
	}

	function setSize({ width, height }: { width: number; height: number }) {
		setCanvasSize(width, height);
		compositor.setSize({ width, height });
		requestRender();
	}

	const timeUniformName = findUniformName(fragment + vertex, "time");

	if (timeUniformName && primaryPass.uniforms[timeUniformName] === undefined) {
		loop(({ time }) => {
			(primaryPass.uniforms as Record<string, number>)[timeUniformName] = time / 500;
		});
	}

	if (canvas instanceof HTMLCanvasElement) {
		// Don't listen for resize on an OffscreenCanvas (possibly in a worker)
		onCanvasResize(canvas, ({ size }) => {
			setSize({ width: size.width * dpr, height: size.height * dpr });
		});
	}

	function render() {
		compositor.render();
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

	return { gl, render, canvas, setSize, dpr, uniforms: primaryPass.uniforms };
};
