import { useWebGLCanvas } from "usegl";
import "./styles.css";

useWebGLCanvas({
  canvas: "#glCanvas",
  vertex: /*glsl*/ `
    attribute vec2 aPosition;
    attribute vec3 aColor;
    varying vec3 vColor;

    void main() {
      gl_Position = vec4(aPosition, 0., 1.0);
      vColor = aColor;
    }
  `,
  fragment: /* glsl */ `
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.);
    }
`,
  attributes: {
    aPosition: {
      size: 2,
      data: [
        [-0.5, 0.5],
        [-0.5, -0.5],
        [0.5, 0.5],
        [0.5, -0.5],
      ].flat(),
    },
    aColor: {
      size: 3,
      data: [
        [1, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
        [1, 1, 0],
      ].flat(),
    },
    index: {
      size: 1,
      data: [0, 1, 2, 1, 3, 2],
    },
  },
});
