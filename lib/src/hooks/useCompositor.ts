import { createRenderTarget } from "../core/renderTarget";
import type { CompositePostEffect, EffectUniforms, PostEffect, RenderPass } from "../types";
import { findUniformName } from "../internal/findName";

/**
 * The compositor handles the combination of the render pass and the post effects:
 * - create the render targets for intermediate passes
 * - provide each post effect with its inputPass to use in uniforms
 * - fill the texture uniforms with the previous pass if they are not provided in uniforms
 * - render all passes in the correct order
 */
export function useCompositor<U extends EffectUniforms>(
  gl: WebGL2RenderingContext,
  renderPass: RenderPass<U>,
  effects: Array<PostEffect | CompositePostEffect>,
) {
  const flatEffects = effects.flat();

  createRenderTargets(flatEffects, renderPass, gl);
  setInputPasses(renderPass, effects);
  autofillTextureUniforms(flatEffects, renderPass);

  const allPasses = [renderPass, ...flatEffects];

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

/**
 * Initialize the gl context of the effect passes and create the render targets
 */
function createRenderTargets(
  flatEffects: PostEffect[],
  renderPass: RenderPass<any>,
  gl: WebGL2RenderingContext,
) {
  if (flatEffects.length > 0 && renderPass.target === null) {
    renderPass.setTarget(createRenderTarget(gl));
  }

  for (const [index, effect] of flatEffects.entries()) {
    effect.initialize(gl);
    effect.setTarget(index === flatEffects.length - 1 ? null : createRenderTarget(gl));
  }
}

/**
 * Provide each effect with its "inputPass":
 * - if the effect has only one pass, the inputPass is the pass preceeding this effect
 * - if the effect has multiple passes, the inputPass is the pass preceeding the first pass of the effect
 */
function setInputPasses(
  renderPass: RenderPass<any>,
  effects: (PostEffect | CompositePostEffect)[],
) {
  let previousPass = renderPass;

  for (const effect of effects) {
    if (Array.isArray(effect)) {
      const inputPass = previousPass;
      for (const effectPass of effect) {
        setTextureUniforms(effectPass, inputPass);
      }
      previousPass = effect.at(-1)!;
    } else {
      setTextureUniforms(effect, previousPass);
      previousPass = effect;
    }
  }
}

function setTextureUniforms(effect: PostEffect, inputPass: RenderPass<any>) {
  for (const uniformName of Object.keys(effect.uniforms)) {
    const uniformValue = effect.uniforms[uniformName];
    if (typeof uniformValue === "function") {
      effect.uniforms[uniformName] = () => uniformValue({ inputPass });
    }
  }
}

/**
 * For each effect pass, find the first texture uniform that has no value provided,
 * and fill it with the previous pass.
 */
function autofillTextureUniforms(flatEffects: PostEffect[], renderPass: RenderPass<any>) {
  for (const [index, effect] of flatEffects.entries()) {
    const textureUniformName =
      findUniformName(effect.fragment, "image") ||
      findUniformName(effect.fragment, "texture") ||
      findUniformName(effect.fragment, "pass");

    if (textureUniformName && effect.uniforms[textureUniformName] === undefined) {
      effect.uniforms[textureUniformName] = () =>
        (index > 0 ? flatEffects[index - 1] : renderPass).target?.texture;
    }
  }
}
