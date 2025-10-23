import { createRenderTarget } from "../../core/renderTarget";
import { useCompositeEffectPass } from "../../hooks/useCompositeEffectPass";
import { floatTargetConfig, useEffectPass } from "../../hooks/useEffectPass";
import type { RenderTarget } from "../../types";
import trailsFragment from "./glsl/trails.frag";
import outputFragment from "./glsl/output.frag";

export type TrailsParams = {
  /**
   * Intensity of the erosion effect that makes the trails shorter.
   * @default 0
   */
  erosion?: number;
  /**
   * Intensity of the trails fadeout. Higher values make the trails fade out faster.
   * @default 0.25
   */
  fadeout?: number;
  /**
   * Color of the tail of the trails as [r, g, b, a], each component between 0 and 1.
   * @default [1, 1, 1, 1]
   */
  tailColor?: [number, number, number, number];
  /**
   * How quickly the original color fades to the tail color.
   * @default 0
   */
  tailColorFalloff?: number;
};

export function trails(params?: TrailsParams) {
  const { fadeout = 0.25, tailColor = [1, 1, 1, 1], tailColorFalloff = 0 } = params || {};
  let erosion = Math.pow(params?.erosion ?? 0, 2);

  let fboRead: RenderTarget;
  let fboWrite: RenderTarget;

  function swap() {
    const temp = fboRead;
    fboRead = fboWrite;
    fboWrite = temp;
  }

  const trailPass = useEffectPass({
    fragment: trailsFragment,
    uniforms: {
      uRenderTexture: ({ inputPass }) => inputPass.target!.texture,
      uPreviousTrailTexture: () => fboRead.texture,
      uKernelSize: [0, 0],
      uTailColor: tailColor,
      uTailColorFalloff: tailColorFalloff,
      uFadeout: fadeout,
    },
  });

  const outputPass = useEffectPass({
    fragment: outputFragment,
    uniforms: {
      uRenderTexture: ({ inputPass }) => inputPass.target!.texture,
      uTrailTexture: () => trailPass.target!.texture,
    },
  });

  const uniforms = {
    get uErosion() {
      return erosion;
    },
    set uErosion(value: number) {
      erosion = Math.pow(value, 2);
      trailPass.uniforms.uKernelSize = [erosion / fboRead.width, erosion / fboRead.height];
    },
    get uFadeout() {
      return trailPass.uniforms.uFadeout;
    },
    set uFadeout(value: number) {
      trailPass.uniforms.uFadeout = value;
    },
    get uTailColor() {
      return trailPass.uniforms.uTailColor;
    },
    set uTailColor(value: [number, number, number, number]) {
      trailPass.uniforms.uTailColor = value;
    },
    get uTailColorFalloff() {
      return trailPass.uniforms.uTailColorFalloff;
    },
    set uTailColorFalloff(value: number) {
      trailPass.uniforms.uTailColorFalloff = value;
    },
  };

  const trailsPass = useCompositeEffectPass([trailPass, outputPass], uniforms);

  trailsPass.onInit((gl) => {
    fboRead = createRenderTarget(gl, floatTargetConfig);
    fboWrite = createRenderTarget(gl, floatTargetConfig);
  });

  trailsPass.onResize((width, height) => {
    fboRead.setSize(width, height);
    fboWrite.setSize(width, height);
    trailPass.uniforms.uKernelSize = [erosion / fboRead.width, erosion / fboRead.height];
  });

  trailsPass.onBeforeRender(() => {
    trailPass.setTarget(fboWrite);
  });

  trailsPass.onAfterRender(swap);

  return trailsPass;
}
