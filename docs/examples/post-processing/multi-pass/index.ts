import { useEffectPass, useWebGLCanvas, useCompositeEffectPass } from "usegl";
import directionalBlurFragment from "./blur.frag?raw";
import combineFragment from "./combine.frag?raw";
import dotsFragment from "./dots.frag?raw";
import { Pane } from "tweakpane";
import "./styles.css";

const horizontalBlur = useEffectPass({
  fragment: directionalBlurFragment,
  uniforms: {
    uTexture: ({ inputPass }) => inputPass.target!.texture, // optional, the texture uniform is automatically set
    uDirection: [1, 0],
    uRadius: 30,
  },
});

const verticalBlur = useEffectPass({
  fragment: directionalBlurFragment,
  uniforms: {
    uTexture: () => horizontalBlur.target!.texture, // optional, the texture uniform is automatically set
    uDirection: [0, 1],
    uRadius: 30,
  },
});

const combine = useEffectPass({
  fragment: combineFragment,
  uniforms: {
    uBaseImage: ({ inputPass }) => inputPass.target!.texture,
    uBloomTexture: ({ previousPass }) => previousPass.target!.texture, // same as () => verticalBlur.target!.texture
    uMix: 1,
  },
});

const bloomPasses = [horizontalBlur, verticalBlur, combine];

const bloomUniforms = {
  get uRadius() {
    return verticalBlur.uniforms.uRadius;
  },
  set uRadius(value: number) {
    verticalBlur.uniforms.uRadius = value;
    horizontalBlur.uniforms.uRadius = value;
  },
  get uMix() {
    return combine.uniforms.uMix;
  },
  set uMix(value: number) {
    combine.uniforms.uMix = value;
  },
};

const bloom = useCompositeEffectPass(bloomPasses, bloomUniforms);

useWebGLCanvas({
  canvas: "#glCanvas",
  dpr: 1,
  fragment: dotsFragment,
  postEffects: [bloom],
});

const pane = new Pane({ title: "Uniforms" });

// Updating the uniforms of the composite pass will update those of the individual passes,
// which will trigger a re-render
const bloomFolder = pane.addFolder({ title: "Bloom" });
bloomFolder.addBinding(bloomUniforms, "uMix", { min: 0, max: 1 });
bloomFolder.addBinding(bloomUniforms, "uRadius", { min: 0, max: 50 });
