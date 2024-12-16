import { useWebGLCanvas } from "usegl";
import "./styles.css";

const { onAfterRender } = useWebGLCanvas({
  canvas: "#glCanvas",
  fragment: /* glsl */ `
    varying vec2 uv;
    uniform vec2 resolution;

    void main() {
      vec2 center = resolution / 2.;
      float dist = distance(uv * resolution, center);
      float radius = .2;
      float radiusPx = min(resolution.x, resolution.y) * radius;
      float circle = 1. - smoothstep(radiusPx * .99, radiusPx * 1.01, dist);
      vec3 color = vec3(0., (uv - .5 + radius) * 2.) * circle;
      gl_FragColor = vec4(color, 1.);
    }
  `,
});

const renderCount = document.querySelector('#renderCount')
onAfterRender(() => {
  renderCount.textContent = `${Number(renderCount.textContent) + 1}`;
});

/**
 * When resizing the window (or just the canvas):
 * - The canvas size is updated
 * - The resolution uniform is updated
 * - The scene is re-rendered
 */
