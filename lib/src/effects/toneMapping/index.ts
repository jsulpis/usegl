import { useEffectPass } from "../../hooks/useEffectPass";

import acesFragment from "./glsl/aces.frag";
import reinhardFragment from "./glsl/reinhard.frag";
import hableFragment from "./glsl/hable.frag";
import neutralFragment from "./glsl/neutral.frag";
import cineonFragment from "./glsl/cineon.frag";
import agxFragment from "./glsl/agx.frag";

export type ToneMappingParams = {
  exposure?: number;
};

function createToneMappingPass(fragment: string, params: ToneMappingParams = {}) {
  const { exposure = 1 } = params;
  return useEffectPass({
    fragment,
    uniforms: {
      uExposure: exposure,
    },
  });
}

export function reinhardToneMapping(params: ToneMappingParams = {}) {
  return createToneMappingPass(reinhardFragment, params);
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
