import { createRenderTarget } from "../core/renderTarget";
import { findUniformName } from "../internal/findName";
import type { CompositeEffectPass, EffectPass, RenderPass } from "../types";
import { floatTargetConfig } from "./useEffectPass";

/**
 * The compositor handles the combination of the render pass and the effects:
 * - initialize the gl context and create render targets for all effects
 * - provide each effect with its previousPass and inputPass to use in uniforms
 * - detect the first texture uniform of each effect and, if it has no value provided, fill it with the previous pass
 * - render all passes in the correct order
 */
export function useCompositor(
  gl: WebGL2RenderingContext,
  renderPass: RenderPass<any>,
  effects: Array<EffectPass<any> | CompositeEffectPass<any>>,
) {
  // add the ability to render to floating-point buffers
  gl.getExtension("EXT_color_buffer_float");

  if (effects.length > 0 && renderPass.target === null) {
    renderPass.setTarget(createRenderTarget(gl, floatTargetConfig));
  }

  let previousPass = renderPass;

  for (const [index, effect] of effects.entries()) {
    effect.initialize(gl);

    if (index === effects.length - 1 && effect.target !== null) {
      effect.setTarget(null);
    }

    if (isCompositeEffectPass(effect)) {
      const inputPass = previousPass;
      for (const effectPass of effect.passes) {
        const previousPassRef = previousPass;
        setupEffectPass(effectPass, previousPassRef, inputPass);
        previousPass = effectPass;
      }
    } else {
      setupEffectPass(effect, previousPass);
      previousPass = effect;
    }
  }

  const allPasses = [renderPass, ...effects];

  function render() {
    for (const pass of allPasses) {
      pass.render();
    }
  }

  function setSize(size: { width: number; height: number }) {
    for (const pass of allPasses) {
      pass.setSize(size);
    }
  }

  return { render, setSize, allPasses };
}

function isCompositeEffectPass(
  effect: EffectPass | CompositeEffectPass<any>,
): effect is CompositeEffectPass<any> {
  return Array.isArray((effect as CompositeEffectPass).passes);
}

function setupEffectPass(
  effect: EffectPass<any>,
  previousPass: EffectPass<any> | RenderPass<any>,
  inputPass?: EffectPass<any> | RenderPass<any>,
) {
  // provide the previousPass and inputPass to the uniforms functions
  for (const uniformName of Object.keys(effect.uniforms)) {
    const uniformValue = effect.uniforms[uniformName];
    if (typeof uniformValue === "function") {
      effect.uniforms[uniformName] = () => uniformValue({ previousPass, inputPass });
    }
  }

  // detect the first texture uniform and, if it has no texture provided, fill it with the previous pass
  const textureUniformName =
    findUniformName(effect.fragment, "image") ||
    findUniformName(effect.fragment, "texture") ||
    findUniformName(effect.fragment, "pass");

  if (textureUniformName && effect.uniforms[textureUniformName] === undefined) {
    effect.uniforms[textureUniformName] = () => previousPass.target?.texture;
  }
}
