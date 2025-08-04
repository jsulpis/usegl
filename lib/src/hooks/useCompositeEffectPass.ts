import { createRenderTarget } from "../core/renderTarget";
import { useLifeCycleCallback } from "../internal/useLifeCycleCallback";
import type {
  CompositeEffectPass,
  EffectPass,
  RenderCallback,
  RenderTarget,
  UpdatedCallback,
} from "../types";

export function useCompositeEffectPass<P extends Record<string, EffectPass<any>>>(
  passes: P,
): CompositeEffectPass<P> {
  const effectPasses = Object.values(passes);
  const outputPass = effectPasses.at(-1)!;

  const [beforeRenderCallbacks, onBeforeRender] = useLifeCycleCallback<RenderCallback<any>>();
  const [afterRenderCallbacks, onAfterRender] = useLifeCycleCallback<RenderCallback<any>>();
  const [onUpdatedCallbacks, onUpdated] = useLifeCycleCallback<UpdatedCallback<any>>();

  function render() {
    for (const callback of beforeRenderCallbacks) callback({ uniforms: {} });
    for (const pass of effectPasses) pass.render();
    for (const callback of afterRenderCallbacks) callback({ uniforms: {} });
  }

  function initialize(gl: WebGL2RenderingContext) {
    for (const [index, pass] of effectPasses.entries()) {
      pass.initialize(gl);

      if (index < effectPasses.length - 1 && pass.target == undefined) {
        pass.setTarget(createRenderTarget(gl));
      }

      pass.onUpdated((newUniforms, oldUniforms) => {
        for (const callback of onUpdatedCallbacks) {
          callback(newUniforms, oldUniforms);
        }
      });
    }
  }

  function setSize(size: { width: number; height: number }) {
    for (const pass of effectPasses) {
      pass.setSize(size);
    }
  }

  function setTarget(target: RenderTarget | null) {
    outputPass.setTarget(target);
  }

  return {
    target: outputPass.target,
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
