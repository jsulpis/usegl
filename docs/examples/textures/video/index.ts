import { loadVideoTexture, useWebGLCanvas } from "usegl";
import "./styles.css";

useWebGLCanvas({
  canvas: "#glCanvas",
  fragment: /* glsl */ `
    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main() {
      vec3 color = texture(uTexture, vUv).rgb;

      // try playing with the colors here
      //color = color.rbg;

      gl_FragColor = vec4(color, 1.);
    }
  `,
  uniforms: {
    uTexture: loadVideoTexture(
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    ),
  },
});
