import { useWebGLCanvas } from "usegl";
import "./styles.css";

useWebGLCanvas({
  canvas: "#glCanvas",
  fragment: /* glsl */ `
    in vec2 vUv;
    uniform sampler2D uDataTexture;
    out vec4 fragColor;

    void main() {
      fragColor = texture(uDataTexture, vUv);
    }
  `,
  uniforms: {
    uDataTexture: {
      data: new Uint8Array(
        [
          [255, 0, 0, 255], // red
          [0, 255, 0, 255], // green
          [0, 0, 255, 255], // blue
          [255, 255, 0, 255], // yellow
          [255, 0, 255, 255], // magenta
          [0, 255, 255, 255], // cyan
          [255, 255, 255, 255], // white
          [128, 128, 128, 255], // gray
          [0, 0, 0, 255], // black
        ].flat(),
      ),
      width: 3,
      height: 3,
      magFilter: "nearest",
    },
  },
});
