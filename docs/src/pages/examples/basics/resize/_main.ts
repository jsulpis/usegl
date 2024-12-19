import { useWebGLCanvas } from "usegl";
import "./styles.css";

const { onAfterRender } = useWebGLCanvas({
  canvas: "#glCanvas",
  fragment: /* glsl */ `
    varying vec2 uv; // automatically provided
    uniform vec2 resolution; // automatically provided and updated
    #define RADIUS .2

    void main() {
      vec2 center = resolution / 2.;
      float dist = distance(uv * resolution, center);
      float radiusPx = min(resolution.x, resolution.y) * RADIUS;
      float circleMask = 1. - smoothstep(radiusPx * .99, radiusPx * 1.01, dist);
      vec3 color = vec3((uv - .5 + RADIUS) * 2., 1.) * circleMask;
      gl_FragColor = vec4(color, 1.);
    }
  `,
});

const renderCount = document.querySelector("#renderCount");
onAfterRender(() => {
  renderCount.textContent = `${Number(renderCount.textContent) + 1}`;
});

/**
 * When resizing the window (or just the canvas):
 * - The canvas size is updated
 * - The resolution uniform is updated
 * - The scene is re-rendered
 */
