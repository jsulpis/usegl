import { useWebGLCanvas, bloom, hableToneMapping } from "usegl";
import { Pane } from "tweakpane";
import fragment from "./dots.frag?raw";
import "./styles.css";

const bloomEffect = bloom();
const toneMapping = hableToneMapping({ exposure: 3 });

useWebGLCanvas({
  canvas: "#glCanvas",
  fragment,
  postEffects: [bloomEffect, toneMapping],
});

// You can dynamically update the uniforms of an effect pass, like any other pass
const pane = new Pane({ title: "Uniforms" });

const bloomUniforms = pane.addFolder({ title: "Bloom" });
bloomUniforms.addBinding(bloomEffect.uniforms, "uRadius", { min: 0, max: 1 });
bloomUniforms.addBinding(bloomEffect.uniforms, "uMix", { min: 0, max: 1 });

const toneMappingUniforms = pane.addFolder({ title: "Tone Mapping" });
toneMappingUniforms.addBinding(toneMapping.uniforms, "uExposure", { min: 0, max: 5 });
