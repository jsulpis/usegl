import { useResizeObserver } from "./useResizeObserver";
import type { Attribute, DrawMode, PostEffect, Uniforms } from "../types";
import { useWebGLContext } from "./useWebGLContext";
import { useQuadRenderPass } from "./useQuadRenderPass";
import { useCompositor } from "./useCompositor";
import { findUniformName } from "../internal/findName";
import type { LoopOptions } from "./useLoop";
import { useLoop } from "./useLoop";

interface Props<U extends Uniforms> extends LoopOptions {
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
		immediate,
	} = props;

	const { gl, canvas, setSize: setCanvasSize } = useWebGLContext(canvasProp);

	const primaryPass = useQuadRenderPass(gl, props);
	const compositor = useCompositor(gl, primaryPass, postEffects);

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

	for (const pass of compositor.allPasses) {
		pass.onUpdated(requestRender);
	}

	function setSize({ width, height }: { width: number; height: number }) {
		setCanvasSize(width, height);
		compositor.setSize({ width, height });
		requestRender();
	}

	const timeUniformName = findUniformName(fragment + vertex, "time");
	let play = () => {};
	let pause = () => {};

	if (timeUniformName && primaryPass.uniforms[timeUniformName] === undefined) {
		requestAnimationFrame(() => {
			// use RAF to avoid triggering an extra render for the initialization of the time uniform
			(primaryPass.uniforms as Record<string, number>)[timeUniformName] = 0;
		});

		({ play, pause } = useLoop(
			({ deltaTime }) => {
				(primaryPass.uniforms as Record<string, number>)[timeUniformName] += deltaTime / 500;
			},
			{ immediate },
		));
	}

	const resizeObserver =
		canvas instanceof HTMLCanvasElement
			? useResizeObserver(canvas, ({ size }) => {
					setSize({ width: size.width * dpr, height: size.height * dpr });
				})
			: null; // Don't listen for resize on an OffscreenCanvas (possibly in a worker)

	return {
		gl,
		render,
		canvas,
		setSize,
		play,
		pause,
		dpr,
		uniforms: primaryPass.uniforms,
		onUpdated: primaryPass.onUpdated,
		onBeforeRender: primaryPass.onBeforeRender,
		onAfterRender: primaryPass.onAfterRender,
		resizeObserver,
	};
};
