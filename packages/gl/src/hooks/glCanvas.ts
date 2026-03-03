import { onResize, loop } from "@radiance/helpers";
import type { UseLoopOptions } from "@radiance/helpers";
import type { CompositeEffectPass, EffectPass, Uniforms } from "../types";
import { glContext } from "./glContext";
import type { QuadPassOptions } from "./quadRenderPass";
import { quadRenderPass } from "./quadRenderPass";
import { compositor } from "./compositor";
import { findUniformName } from "../internal/findName";
import { isHTMLImageTexture, isHTMLVideoTexture } from "../core/texture";
import { createHook } from "../internal/createHook";

interface Props<U extends Uniforms> extends UseLoopOptions, QuadPassOptions<U> {
  canvas: HTMLCanvasElement | OffscreenCanvas | string;
  webglOptions?: WebGLContextAttributes;
  dpr?: number;
  postEffects?: Array<EffectPass<any> | CompositeEffectPass<any>>;
  renderMode?: "manual" | "auto";
  colorSpace?: PredefinedColorSpace;
}

export const glCanvas = <U extends Uniforms>(props: Props<U>) => {
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
  } = glContext(canvasProp, { ...webglOptions, colorSpace });

  const renderPass = quadRenderPass(gl, props);
  const mainCompositor = compositor(gl, renderPass, postEffects);

  // don't render before the first resize of the canvas to avoid a glitch
  let isCanvasResized = false;

  function render() {
    if (isCanvasResized) {
      mainCompositor.render();
    }
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

  for (const pass of mainCompositor.allPasses) {
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
    mainCompositor.setSize({ width, height });
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

    ({ play, pause } = loop(
      ({ deltaTime }) => {
        (renderPass.uniforms as Record<string, number>)[timeUniformName] += deltaTime / 500;
      },
      { immediate },
    ));
  }

  let resizeObserver: ReturnType<typeof onResize> | null = null;

  const [onCanvasReady, executeCanvasReadyCallbacks] = createHook();

  function resizeCanvas(width: number, height: number, dpr: number) {
    setSize({ width: width * dpr, height: height * dpr });
    if (!isCanvasResized) {
      executeCanvasReadyCallbacks();
      isCanvasResized = true;
    }
  }

  // resize only if HTMLCanvasElement, because we can't know the size of an OffscreenCanvas
  if (canvas instanceof HTMLCanvasElement) {
    if (canvas.getAttribute("width") && canvas.getAttribute("height")) {
      resizeCanvas(canvas.width, canvas.height, 1);
    }
    // don't automatically resize if the renderMode is manual, because the call to gl.viewport() will break the canvas
    else if (renderMode === "auto") {
      resizeObserver = onResize(canvas, ({ size }) => {
        resizeCanvas(size.width, size.height, dpr);
      });
    } else {
      resizeCanvas(canvas.clientWidth, canvas.clientHeight, dpr);
    }
  }

  return {
    gl,
    render,
    /**
     * Register a callback to execute after the initial resizing of the canvas.
     */
    onCanvasReady,
    canvas,
    setSize,
    play,
    pause,
    dpr,
    uniforms: renderPass.uniforms,
    onUpdated: renderPass.onUpdated,
    onBeforeRender: mainCompositor.onBeforeRender,
    onAfterRender: mainCompositor.onAfterRender,
    resizeObserver,
  };
};
