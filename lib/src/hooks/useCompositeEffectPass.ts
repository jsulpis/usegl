import { useHook } from "../internal/useHook";
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

  const [onBeforeRender, executeBeforeRenderCallbacks] = useHook<RenderCallback<any>>();
  const [onAfterRender, executeAfterRenderCallbacks] = useHook<RenderCallback<any>>();
  const [onUpdated, executeUpdateCallbacks] = useHook<UpdatedCallback<any>>();
  const [onResize, executeResizeCallbacks] = useHook<(width: number, height: number) => void>();
  const [onInit, executeInitCallbacks] = useHook<(gl: WebGL2RenderingContext) => void>();

  function render() {
    executeBeforeRenderCallbacks({ uniforms });
    for (const pass of passes) pass.render();
    executeAfterRenderCallbacks({ uniforms });
  }

  function initialize(gl: WebGL2RenderingContext) {
    for (const pass of passes) {
      pass.initialize(gl);
      pass.onUpdated((newUniforms, oldUniforms) => {
        executeUpdateCallbacks(newUniforms, oldUniforms);
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
