import { useWebGLCanvas } from "usegl";
import "./styles.css";

useWebGLCanvas({
  canvas: "#glCanvas",
  fragment: /* glsl */ `
    varying vec4 v_color;

    void main () {
      gl_FragColor = v_color;
    }
  `,
  vertex: /* glsl */ `
    attribute vec4 position;
    attribute vec4 color;
    varying vec4 v_color;

    void main () {
      gl_Position = position;
      v_color = color;

      // Only for the drawing mode "POINTS"
      gl_PointSize = 40.;
    }
  `,
  attributes: {
    position: {
      data: [
        [-0.5, -0.5],
        [-0.5, 0.5],
        [0.5, 0.5],
        [0.5, -0.5],
      ].flat(),
      size: 2,
    },
    color: {
      data: [
        [0, 1, 1],
        [0, 1, 0],
        [0, 0, 1],
        [0, 1, 1],
      ].flat(),
      size: 3,
    },
  },
  // drawMode: "LINES",
  // drawMode: "LINE_STRIP",
  // drawMode: "LINE_LOOP",
  // drawMode: "POINTS",
  // drawMode: "TRIANGLES",
  // drawMode: "TRIANGLE_FAN",
  drawMode: "TRIANGLE_STRIP",
});
