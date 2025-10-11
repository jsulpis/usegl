import { useLifeCycleCallback } from "../internal/useLifeCycleCallback";
import type {
  CompositeEffectPass,
  EffectPass,
  RenderCallback,
  RenderTarget,
  Uniforms,
  UpdatedCallback,
} from "../types";

export function useCompositeEffectPass<U extends Uniforms = Record<string, never>>(
  passes: EffectPass<Uniforms>[],
  uniforms: U = {} as U,
): CompositeEffectPass<U> {
  const outputPass = passes.at(-1)!;

  const [beforeRenderCallbacks, onBeforeRender] = useLifeCycleCallback<RenderCallback<any>>();
  const [afterRenderCallbacks, onAfterRender] = useLifeCycleCallback<RenderCallback<any>>();
  const [onUpdatedCallbacks, onUpdated] = useLifeCycleCallback<UpdatedCallback<any>>();
  const [onResizeCallbacks, onResize] =
    useLifeCycleCallback<(width: number, height: number) => void>();
  const [onInitCallbacks, onInit] = useLifeCycleCallback<(gl: WebGL2RenderingContext) => void>();

  function render() {
    for (const callback of beforeRenderCallbacks) callback({ uniforms: {} });
    for (const pass of passes) pass.render();
    for (const callback of afterRenderCallbacks) callback({ uniforms: {} });
  }

  function initialize(gl: WebGL2RenderingContext) {
    for (const pass of passes) {
      pass.initialize(gl);

      pass.onUpdated((newUniforms, oldUniforms) => {
        for (const callback of onUpdatedCallbacks) {
          callback(newUniforms, oldUniforms);
        }
      });
    }
    for (const callback of onInitCallbacks) {
      callback(gl);
    }
  }

  function setSize(size: { width: number; height: number }) {
    for (const pass of passes) {
      pass.setSize(size);
    }
    for (const callback of onResizeCallbacks) {
      callback(size.width, size.height);
    }
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
