import { useCompositeEffectPass } from "../../hooks/useCompositeEffectPass";
import { useEffectPass } from "../../hooks/useEffectPass";
import type { EffectPass } from "../../types";

import { RenderTargetParams } from "../../core/renderTarget";
import { downSampleFragment } from "./glsl/downsample.frag";
import { combineFragment } from "./glsl/combine.frag";
import { sampleVertex } from "./glsl/sample.vert";
import { upsampleFragment } from "./glsl/upsample.frag";

export type BloomParams = {
  levels?: number;
  radius?: number;
  mix?: number;
};

const floatTargetConfig: RenderTargetParams = {
  internalFormat: WebGL2RenderingContext.RGBA16F,
  type: WebGL2RenderingContext.HALF_FLOAT,
  minFilter: "linear",
  magFilter: "linear",
};

export function bloom(params: BloomParams = {}) {
  const { levels = 8, radius = 0.65, mix = 0.5 } = params;

  const downsamplePasses: EffectPass<any>[] = [];

  // --- Downsample pyramid (progressively half resolution) ---
  for (let level = 1; level <= levels; level++) {
    const pass = useEffectPass({
      fragment: downSampleFragment,
      target: floatTargetConfig,
      vertex: sampleVertex,
      resolutionScale: 1 / 2 ** level,
      uniforms: {
        uTexelSizeMultiplier: 0.5,
      },
    });
    downsamplePasses.push(pass);
  }

  // --- Upsample & accumulate ---
  const upsamplePasses: EffectPass<any>[] = [];

  for (let level = levels - 1; level >= 1; level--) {
    const pass = useEffectPass({
      fragment: upsampleFragment,
      target: floatTargetConfig,
      vertex: sampleVertex,
      resolutionScale: 1 / 2 ** level,
      uniforms: {
        uTexelSizeMultiplier: 1,
        uCurrentTexture: () => downsamplePasses[level].target!.texture,
        uPreviousTexture:
          level === levels - 1
            ? () => downsamplePasses.at(-1)!.target!.texture
            : () => upsamplePasses[levels - 1 - level - 1].target!.texture,
        uRadius: radius,
      },
    });
    upsamplePasses.push(pass);
  }

  // --- Combine original + bloom ---
  const combine = useEffectPass({
    fragment: combineFragment,
    target: floatTargetConfig,
    uniforms: {
      uImage: ({ inputPass }) => inputPass.target!.texture,
      uBloomTexture: ({ previousPass }) => previousPass.target!.texture,
      uMix: mix,
    },
  });

  const bloomPasses = [...downsamplePasses, ...upsamplePasses, combine];

  const bloomUniforms = {
    get uRadius() {
      return upsamplePasses[0].uniforms.uRadius;
    },
    set uRadius(value: number) {
      upsamplePasses.forEach((pass) => {
        pass.uniforms.uRadius = value;
      });
    },
    get uMix() {
      return combine.uniforms.uMix;
    },
    set uMix(value: number) {
      combine.uniforms.uMix = value;
    },
  };

  return useCompositeEffectPass(bloomPasses, bloomUniforms);
}
