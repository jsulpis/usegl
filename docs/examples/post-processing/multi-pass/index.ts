import { useEffectPass, useWebGLCanvas, useCompositeEffectPass } from "usegl";
import fragment from "./circles.frag?raw";
import mipmapsShader from "./mipmap.frag?raw";
import blurShader from "./blur.frag?raw";
import combineShader from "./combine.frag?raw";
import { Pane } from "tweakpane";
import "./styles.css";

const mipmaps = useEffectPass({
  fragment: mipmapsShader,
  uniforms: {
    uThreshold: 0.2,
  },
});

const horizontalBlur = useEffectPass({
  fragment: blurShader,
  uniforms: {
    uDirection: [1, 0],
  },
});

const verticalBlur = useEffectPass({
  fragment: blurShader,
  uniforms: {
    uDirection: [0, 1],
  },
});

const combine = useEffectPass({
  fragment: combineShader,
  uniforms: {
    uBaseImage: ({ inputPass }) => inputPass.target!.texture,
    uBloomTexture: () => verticalBlur.target!.texture,
    uMix: 1,
  },
});

const bloomEffect = useCompositeEffectPass({
  mipmaps,
  horizontalBlur,
  verticalBlur,
  combine,
});

const vignetteEffect = useEffectPass({
  fragment: /* glsl */ `
    uniform sampler2D uTexture;
    uniform float uSize;      // (0.0 - 1.0)
    uniform float uRoundness; // (0.0 = rectangle, 1.0 = round)
    uniform float uStrength;  // (0.0 - 1.0)
    varying vec2 vUv;

    float vignette() {
      vec2 centered = vUv * 2.0 - 1.0;
      float circDist = length(centered);
      float rectDist = max(abs(centered.x), abs(centered.y));
      float dist = mix(rectDist, circDist, uRoundness);
      return 1. - smoothstep(uSize, uSize * 2., dist) * uStrength;
    }

    void main() {
      vec4 color = texture(uTexture, vUv);
      color.rgb *= vignette();
      gl_FragColor = color;
    }
  `,
  uniforms: {
    uStrength: 0.5,
    uSize: 0.6,
    uRoundness: 0.7,
  },
});

useWebGLCanvas({
  canvas: "#glCanvas",
  fragment: fragment,
  postEffects: [vignetteEffect, bloomEffect],
});

const pane = new Pane({ title: "Uniforms" });

// You can update the uniforms of each individual pass, which will trigger a re-render
const bloom = pane.addFolder({ title: "Bloom" });
bloom.addBinding(bloomEffect.passes.mipmaps.uniforms, "uThreshold", { min: 0, max: 1 });
bloom.addBinding(combine.uniforms, "uMix", { min: 0, max: 1 });

const vignette = pane.addFolder({ title: "Vignette" });
vignette.addBinding(vignetteEffect.uniforms, "uStrength", { min: 0, max: 1 });
vignette.addBinding(vignetteEffect.uniforms, "uSize", { min: 0, max: 1 });
vignette.addBinding(vignetteEffect.uniforms, "uRoundness", { min: 0, max: 1 });
