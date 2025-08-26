import { useEffectPass } from "../../hooks/useEffectPass";

import acesFragment from "./glsl/aces.frag";
import reinhardFragment from "./glsl/reinhard.frag";
import hableFragment from "./glsl/hable.frag";
import neutralFragment from "./glsl/neutral.frag";
import cineonFragment from "./glsl/cineon.frag";
import agxFragment from "./glsl/agx.frag";

export type ToneMappingParams = {
  /**
   * The exposure level to apply to the image before the tone mapping.
   * @default 1
   */
  exposure?: number;
  /**
   * The color space to output the final image in.
   * @default "sRGB"
   */
  outputColorSpace?: "sRGB" | "linear";
};

function createToneMappingPass(fragment: string, params: ToneMappingParams = {}) {
  const { exposure = 1, outputColorSpace = "sRGB" } = params;
  return useEffectPass({
    fragment,
    uniforms: {
      uExposure: exposure,
      uConvertToSRGB: outputColorSpace === "sRGB",
    },
  });
}

type ReinhardToneMappingParams = ToneMappingParams & {
  /**
   * The white point to use for extended Reinhard tone mapping.
   * A value of 1 disables the extended tone mapping.
   *
   * @default 1
   */
  whitePoint?: number;
};

export function reinhardToneMapping(params: ReinhardToneMappingParams = {}) {
  const { exposure = 1, outputColorSpace = "sRGB", whitePoint = 1 } = params;
  return useEffectPass({
    fragment: reinhardFragment,
    uniforms: {
      uExposure: exposure,
      uConvertToSRGB: outputColorSpace === "sRGB",
      uWhitePoint: whitePoint,
    },
  });
}

export function hableToneMapping(params: ToneMappingParams = {}) {
  return createToneMappingPass(hableFragment, params);
}

export function acesToneMapping(params: ToneMappingParams = {}) {
  return createToneMappingPass(acesFragment, params);
}

export function neutralToneMapping(params: ToneMappingParams = {}) {
  return createToneMappingPass(neutralFragment, params);
}

export function cineonToneMapping(params: ToneMappingParams = {}) {
  return createToneMappingPass(cineonFragment, params);
}

export function agxToneMapping(params: ToneMappingParams = {}) {
  return createToneMappingPass(agxFragment, params);
}
