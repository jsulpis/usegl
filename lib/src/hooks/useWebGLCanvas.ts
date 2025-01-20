import { useResizeObserver } from "./useResizeObserver";
import type { CompositeEffectPass, EffectPass, Uniforms } from "../types";
import { useWebGLContext } from "./useWebGLContext";
import type { QuadPassOptions } from "./useQuadRenderPass";
import { useQuadRenderPass } from "./useQuadRenderPass";
import { useCompositor } from "./useCompositor";
import { findUniformName } from "../internal/findName";
import type { UseLoopOptions } from "./useLoop";
import { useLoop } from "./useLoop";
import { isHTMLImageTexture, isHTMLVideoTexture } from "../core/texture";

interface Props<U extends Uniforms> extends UseLoopOptions, QuadPassOptions<U> {
  canvas: HTMLCanvasElement | OffscreenCanvas | string;
  webglOptions?: WebGLContextAttributes;
  dpr?: number;
  postEffects?: Array<EffectPass<any> | CompositeEffectPass<any>>;
  renderMode?: "manual" | "auto";
  colorSpace?: PredefinedColorSpace;
}

export const useWebGLCanvas = <U extends Uniforms>(props: Props<U>) => {
  const {
    canvas: canvasProp,
    fragment,
    vertex,
    dpr = window.devicePixelRatio,
    postEffects = [],
    immediate,
    renderMode = "auto",
    colorSpace,
    webglOptions,
  } = props;

  const {
    gl,
    canvas,
    setSize: setCanvasSize,
  } = useWebGLContext(canvasProp, { ...webglOptions, colorSpace });

  const renderPass = useQuadRenderPass(gl, props);
  const compositor = useCompositor(gl, renderPass, postEffects);

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
    if (requestedRender || renderMode === "manual") return;
    requestedRender = true;

    requestAnimationFrame(() => {
      requestedRender = false;
      render();
    });
  }

  for (const pass of compositor.allPasses) {
    pass.onUpdated(requestRender);

    if (!("uniforms" in pass) || renderMode === "manual") continue;

    // Request a render when an image is loaded or a video frame is rendered
    for (const uniform of Object.values(pass.uniforms)) {
      if (isHTMLImageTexture(uniform) && !uniform.src.complete) {
        uniform.src.addEventListener("load", requestRender, { once: true });
      } else if (isHTMLVideoTexture(uniform)) {
        uniform.src.requestVideoFrameCallback(function onFramePlayed() {
          requestRender();
          uniform.src.requestVideoFrameCallback(onFramePlayed);
        });
      }
    }
  }

  function setSize({ width, height }: { width: number; height: number }) {
    setCanvasSize(width, height);
    compositor.setSize({ width, height });
    requestRender();
  }

  const timeUniformName = findUniformName(fragment + vertex, "time");
  let play = () => {};
  let pause = () => {};

  if (timeUniformName && renderPass.uniforms[timeUniformName] === undefined) {
    requestAnimationFrame(() => {
      // use RAF to avoid triggering an extra render for the initialization of the time uniform
      (renderPass.uniforms as Record<string, number>)[timeUniformName] = 0;
    });

    ({ play, pause } = useLoop(
      ({ deltaTime }) => {
        (renderPass.uniforms as Record<string, number>)[timeUniformName] += deltaTime / 500;
      },
      { immediate },
    ));
  }

  let resizeObserver: ReturnType<typeof useResizeObserver> | null = null;

  // resize only if HTMLCanvasElement, because we can't know the size of an OffscreenCanvas
  if (canvas instanceof HTMLCanvasElement) {
    // don't automatically resize if the renderMode is manual, because the call to gl.viewport() will break the canvas
    if (renderMode === "auto") {
      resizeObserver = useResizeObserver(canvas, ({ size }) => {
        setSize({ width: size.width * dpr, height: size.height * dpr });
      });
    } else {
      setSize({ width: canvas.clientWidth * dpr, height: canvas.clientHeight * dpr });
    }
  }

  return {
    gl,
    render,
    canvas,
    setSize,
    play,
    pause,
    dpr,
    uniforms: renderPass.uniforms,
    onUpdated: renderPass.onUpdated,
    onBeforeRender: renderPass.onBeforeRender,
    onAfterRender: renderPass.onAfterRender,
    resizeObserver,
  };
};
