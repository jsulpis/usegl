import { useCompositeEffectPass } from "../hooks/useCompositeEffectPass";
import { useEffectPass } from "../hooks/useEffectPass";
import type { CompositeEffectPass, EffectPass } from "../types";

import downsampleFragment from "./glsl/downsample.frag?raw";
import sampleVertex from "./glsl/sample.vert?raw";
import upsampleFragment from "./glsl/upsample.frag?raw";
import combineFragment from "./glsl/combine.frag?raw";

export type BloomParams = {
  levels?: number;
  radius?: number;
  mix?: number;
};

const targetConfig = {
  internalFormat: WebGL2RenderingContext.RGBA16F,
  type: WebGL2RenderingContext.FLOAT,
};

export function bloom(params: BloomParams = {}) {
  const { levels = 8, radius = 0.65, mix = 0.5 } = params;

  const passes: Record<string, EffectPass<any>> = {};
  const downsamplePasses: EffectPass<any>[] = [];

  // --- Downsample pyramid (progressively half resolution) ---
  for (let level = 1; level <= levels; level++) {
    const pass = useEffectPass({
      fragment: downsampleFragment,
      vertex: sampleVertex,
      resolutionScale: 1 / 2 ** level,
      target: targetConfig,
      uniforms: {
        uTexelSizeMultiplier: 0.5,
      },
    });
    downsamplePasses.push(pass);
    passes[`downsample${level}`] = pass;
  }

  // --- Upsample & accumulate ---
  const upsamplePasses: EffectPass<any>[] = [];

  for (let level = levels - 1; level >= 1; level--) {
    const pass = useEffectPass({
      fragment: upsampleFragment,
      vertex: sampleVertex,
      resolutionScale: 1 / 2 ** level,
      target: targetConfig,
      uniforms: {
        uTexelSizeMultiplier: 1,
        uCurrentTexture: () => downsamplePasses[level].target!.texture,
        uPreviousTexture:
          level === levels - 1
            ? () => downsamplePasses[levels - 1].target!.texture
            : () => upsamplePasses[levels - 1 - level - 1].target!.texture,
        uRadius: radius,
      },
    });
    upsamplePasses.push(pass);
    passes[`upsample${level}`] = pass;
  }

  // --- Combine original + bloom ---
  const combine = useEffectPass({
    fragment: combineFragment,
    uniforms: {
      uImage: ({ inputPass }) => inputPass.target!.texture,
      uBloomTexture: ({ previousPass }) => previousPass.target!.texture,
      uMix: mix,
    },
  });
  passes["combine"] = combine;

  const compositePass = useCompositeEffectPass(passes);

  return {
    ...compositePass,
    initialize: (gl) => {
      gl.getExtension("EXT_color_buffer_float");
      compositePass.initialize(gl);
    },
  } as CompositeEffectPass;
}
