import { useWebGLCanvas } from "usegl";
import "./styles.css";

useWebGLCanvas({
  canvas: "#glCanvas",
  fragment: /* glsl */ `
    varying vec2 vUv; // automatically provided
    uniform float uTime; // automatically provided and updated

    void main() {
      gl_FragColor = vec4(vUv, sin(uTime) / 2. + .5, 1.);
    }
  `,
});
