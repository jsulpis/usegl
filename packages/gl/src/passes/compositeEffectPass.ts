import { createHook } from "../internal/createHook";
import type { Uniforms } from "../types";
import type { RenderTarget } from "../core/renderTarget";
import type { EffectPass } from "./effectPass";
import type { RenderCallback, UpdatedCallback } from "./renderPass";

/**
 * Creates a composite effect pass from a series of sub-passes.
 * This is useful for complex effects that require multiple steps, like Bloom or Blur.
 *
 * @param passes - Ordered list of sub-passes to execute.
 * @param uniforms - Reactive uniform values for the composite effect.
 * @returns A composite effect pass object.
 */
export function compositeEffectPass<U extends Uniforms = Record<string, never>>(
  passes: EffectPass<Uniforms>[],
  uniforms: U = {} as U,
): CompositeEffectPass<U> {
  const outputPass = passes.at(-1)!;

  const [onBeforeRender, executeBeforeRenderCallbacks] = createHook<RenderCallback<any>>();
  const [onAfterRender, executeAfterRenderCallbacks] = createHook<RenderCallback<any>>();
  const [onUpdated, executeUpdateCallbacks] = createHook<UpdatedCallback<any>>();
  const [onResize, executeResizeCallbacks] = createHook<(width: number, height: number) => void>();
  const [onInit, executeInitCallbacks] = createHook<(gl: WebGL2RenderingContext) => void>();

  function render() {
    executeBeforeRenderCallbacks({ uniforms });
    for (const pass of passes) pass.render();
    executeAfterRenderCallbacks({ uniforms });
  }

  function initialize(gl: WebGL2RenderingContext) {
    for (const pass of passes) {
      pass.initialize(gl);
      pass.onUpdated((...args) => {
        executeUpdateCallbacks(...args);
      });
    }
    executeInitCallbacks(gl);
  }

  function setSize(size: { width: number; height: number }) {
    for (const pass of passes) {
      pass.setSize(size);
    }
    executeResizeCallbacks(size.width, size.height);
  }

  function setTarget(target: RenderTarget | null) {
    outputPass.setTarget(target);
  }

  return {
    get target() {
      return outputPass.target;
    },
    uniforms,
    passes,
    onBeforeRender,
    onAfterRender,
    onUpdated,
    onResize,
    onInit,
    initialize,
    render,
    setSize,
    setTarget,
  };
}

/**
 * An effect pass composed of multiple sub-passes.
 */
export interface CompositeEffectPass<U extends Uniforms = Record<string, never>> extends Omit<
  EffectPass<U>,
  "fragment" | "vertex"
> {
  /** The sequence of sub-passes executed by this composite effect. */
  passes: EffectPass<Uniforms>[];
}
