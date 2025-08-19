import { useWebGLCanvas, bloom, linearToSRGB } from "usegl";
import { Pane } from "tweakpane";
import fragment from "./dots.frag?raw";
import "./styles.css";

const bloomEffect = bloom();

useWebGLCanvas({
  canvas: "#glCanvas",
  fragment,
  postEffects: [bloomEffect, linearToSRGB()],
});

// You can dynamically update the uniforms of an effect pass, like any other pass
const pane = new Pane({ title: "Uniforms" });
pane.addBinding(bloomEffect.uniforms, "uRadius", { min: 0, max: 1 });
pane.addBinding(bloomEffect.uniforms, "uMix", { min: 0, max: 1 });
