import { onResize, loop } from "@radiance/helpers";
import type { LoopParams } from "@radiance/helpers";
import type { Uniforms } from "../types";
import type { CompositeEffectPass } from "../passes/compositeEffectPass";
import type { EffectPass } from "../passes/effectPass";
import type { UpdatedCallback } from "../passes/renderPass";
import { glContext } from "./glContext";
import type { QuadPassParams } from "../passes/quadRenderPass";
import { quadRenderPass } from "../passes/quadRenderPass";
import { compositor } from "../passes/compositor";
import { findUniformName } from "../internal/findName";
import { isHTMLImageTexture, isHTMLVideoTexture } from "../core/texture";
import { createHook } from "../internal/createHook";

/**
 * The main high-level function to manage a WebGL canvas.
 *
 * It combines context creation, a full-screen quad render pass, a post-processing compositor,
 * and automatic rendering/resizing logic.
 *
 * @param params - Configuration params.
 * @returns A {@link GLCanvas} object.
 */
export const glCanvas = <U extends Uniforms>(params: GLCanvasParams<U>): GLCanvas<U> => {
  const {
    canvas: canvasProp,
    fragment,
    vertex,
    dpr = globalThis.devicePixelRatio || 1,
    postEffects = [],
    immediate,
    renderMode = "auto",
    colorSpace,
    webglAttributes,
  } = params;

  const {
    gl,
    canvas,
    setSize: setCanvasSize,
  } = glContext(canvasProp, { ...webglAttributes, colorSpace });

  const renderPass = quadRenderPass(gl, params);
  const mainCompositor = compositor(gl, renderPass, postEffects);

  // flag to not render before the first resize of the canvas to avoid a glitch
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

  if (renderMode === "auto") {
    for (const pass of mainCompositor.allPasses) {
      if (!("uniforms" in pass)) continue;

      pass.onUpdated((uniforms) => {
        requestRender();

        for (const [name, value] of Object.entries(uniforms)) {
          watchUniformValue(name, value, pass);
        }
      });

      for (const [name, value] of Object.entries(pass.uniforms)) {
        watchUniformValue(name, value, pass);
      }
    }
  }

  const [onCanvasReady, executeCanvasReadyCallbacks] = createHook();

  function setSize({ width, height }: { width: number; height: number }) {
    setCanvasSize(width, height);
    mainCompositor.setSize({ width, height });
    requestRender();

    if (!isCanvasResized) {
      executeCanvasReadyCallbacks();
      isCanvasResized = true;
    }
  }

  /**
   * Watch a uniform value for changes that would require re-rendering, such as promises resolving or media loading.
   */
  function watchUniformValue(
    name: string,
    value: unknown,
    pass: { uniforms: Record<string, unknown> },
  ) {
    if (isPromiseLike(value)) {
      value.then((resolvedValue) => (pass.uniforms[name] = resolvedValue));
    } else if (isHTMLImageTexture(value) && !value.src.complete) {
      value.src.addEventListener("load", requestRender, { once: true });
    } else if (isHTMLVideoTexture(value)) {
      value.src.requestVideoFrameCallback(function onFramePlayed() {
        requestRender();
        value.src.requestVideoFrameCallback(onFramePlayed);
      });
    }
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

  if (isOffscreen(canvas) || (canvas.getAttribute("width") && canvas.getAttribute("height"))) {
    setSize({ width: canvas.width, height: canvas.height });
  } else if (renderMode === "manual") {
    setSize({ width: canvas.clientWidth * dpr, height: canvas.clientHeight * dpr });
  } else {
    resizeObserver = onResize(canvas, ({ size }) => {
      setSize({ width: size.width * dpr, height: size.height * dpr });
    });
  }

  return {
    gl,
    render,
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

function isOffscreen(canvas: HTMLCanvasElement | OffscreenCanvas): canvas is OffscreenCanvas {
  return typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas;
}

function isPromiseLike(value: any): value is PromiseLike<unknown> & object {
  return (
    value != null &&
    typeof value === "object" &&
    "then" in value &&
    typeof value.then === "function"
  );
}

/**
 * Configuration params for the {@link glCanvas} function.
 */
export interface GLCanvasParams<U extends Uniforms> extends LoopParams, QuadPassParams<U> {
  /**
   * The canvas element or selector to use.
   */
  canvas: HTMLCanvasElement | OffscreenCanvas | string;
  /**
   * Optional WebGL context attributes.
   */
  webglAttributes?: WebGLContextAttributes;
  /**
   * Device Pixel Ratio for the canvas.
   * @default window.devicePixelRatio
   */
  dpr?: number;
  /**
   * An array of post-processing effects to apply.
   */
  postEffects?: Array<EffectPass<any> | CompositeEffectPass<any>>;
  /**
   * Whether to render automatically on frame changes or manually.
   * @default "auto"
   */
  renderMode?: "manual" | "auto";
  /**
   * Target color space for the drawing buffer.
   */
  colorSpace?: PredefinedColorSpace;
}

/**
 * The object returned by the {@link glCanvas} function.
 */
export interface GLCanvas<U extends Uniforms = Record<string, any>> {
  /** The WebGL2 rendering context. */
  gl: WebGL2RenderingContext;
  /** Executes a single render of the entire pipeline. */
  render: () => void;
  /** Register a callback to execute after the first resizing of the canvas. */
  onCanvasReady: (callback: () => void) => void;
  /** The HTMLCanvasElement or OffscreenCanvas being used. */
  canvas: HTMLCanvasElement | OffscreenCanvas;
  /** Resizes the canvas and all render targets in the pipeline. */
  setSize: (size: { width: number; height: number }) => void;
  /** Resumes the internal animation loop (if a 'time' uniform is detected). */
  play: () => void;
  /** Pauses the internal animation loop. */
  pause: () => void;
  /** The Device Pixel Ratio being used. */
  dpr: number;
  /** Reactive proxy of the main render pass's uniforms. */
  uniforms: U & Record<string, unknown>;
  /** Registers a callback called whenever a uniform of the main render pass is updated. */
  onUpdated: (callback: UpdatedCallback<U>) => void;
  /** Registers a callback called just before the main render pass is rendered. */
  onBeforeRender: (callback: () => void) => void;
  /** Registers a callback called after the last post-processing effect is rendered. */
  onAfterRender: (callback: () => void) => void;
  /** The resize observer managing the canvas resizing. */
  resizeObserver: ReturnType<typeof onResize> | null;
}
