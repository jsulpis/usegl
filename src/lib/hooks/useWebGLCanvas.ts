import { onCanvasResize } from "../helpers/resize";
import { loop } from "../helpers/loop";
import type { Attribute, DrawMode, Uniforms as UniformsType } from "../types";
import { useWebGLContext } from "./useWebGLContext";
import { useQuadRenderPass } from "./useQuadRenderPass";

interface Props<U extends UniformsType> {
	canvas: HTMLCanvasElement | OffscreenCanvas;
	fragment: string;
	vertex?: string;
	uniforms?: U;
	attributes?: Record<string, Attribute>;
	webglOptions?: WebGLContextAttributes;
	drawMode?: DrawMode;
	dpr?: number;
}

export const useWebGLCanvas = <Uniforms extends UniformsType>(props: Props<Uniforms>) => {
	const { canvas, fragment, vertex, dpr = window.devicePixelRatio } = props;

	const { gl, setSize: setCanvasSize } = useWebGLContext(canvas);
	const { render, uniforms } = useQuadRenderPass(gl, props);

	const timeUniformName =
		findName(fragment, "uniform", "time") || findName(vertex, "uniform", "time");
	const resolutionUniformName = findName(fragment, "uniform", "resolution");

	const uniformsProxy = new Proxy(uniforms, {
		set(target, uniform, value) {
			target[uniform] = value;

			requestRender();
			return true;
		},
	});

	function setSize({ width, height }: { width: number; height: number }) {
		setCanvasSize(width, height);
		if (resolutionUniformName) {
			uniformsProxy[resolutionUniformName] = [width, height];
		} else {
			requestRender();
		}
	}

	if (timeUniformName) {
		loop(({ time }) => {
			uniformsProxy[timeUniformName] = time / 500;
		});
	}

	if (canvas instanceof HTMLCanvasElement) {
		// Don't listen for resize on an OffscreenCanvas (possibly in a worker)
		onCanvasResize(canvas, ({ size }) => {
			setSize({ width: size.width * dpr, height: size.height * dpr });
		});
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

	return { gl, render, setSize, dpr, uniforms: uniformsProxy };
};

/**
 * Find the name of an attribute, uniform or varying in a shader source.
 */
function findName(source: string, keyword: string, word: string) {
	return source
		?.split("\n")
		.find((line) => new RegExp(`^${keyword}.*${word};`, "i").test(line.trim()))
		?.match(/(\w+);$/)[1];
}
