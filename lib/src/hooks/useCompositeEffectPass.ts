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
  passes: EffectPass[],
  uniforms: U,
): CompositeEffectPass<U> {
  const outputPass = passes.at(-1)!;

  const [beforeRenderCallbacks, onBeforeRender] = useLifeCycleCallback<RenderCallback<any>>();
  const [afterRenderCallbacks, onAfterRender] = useLifeCycleCallback<RenderCallback<any>>();
  const [onUpdatedCallbacks, onUpdated] = useLifeCycleCallback<UpdatedCallback<any>>();

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
  }

  function setSize(size: { width: number; height: number }) {
    for (const pass of passes) {
      pass.setSize(size);
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
    initialize,
    render,
    setSize,
    setTarget,
  };
}
