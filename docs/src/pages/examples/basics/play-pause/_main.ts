import { useWebGLCanvas } from "usegl";
import "./styles.css";

const { play, pause, canvas, onAfterRender } = useWebGLCanvas({
  canvas: "#glCanvas",
  fragment: /* glsl */ `
    varying vec2 uv;
    uniform float uTime;

    void main() {
      vec2 circleCenter = vec2(
        cos(uTime * .8) * .25 + .5,
        sin(uTime * .8) * .25 + .5
      );
      float circle = 1. - smoothstep(.099, .101, length(uv - circleCenter));
      vec3 color = vec3(circle);

      gl_FragColor = vec4(color, 1.);
    }
  `,
});

pause();

const renderCount = document.querySelector("#renderCount");
onAfterRender(() => {
  renderCount.textContent = `${Number(renderCount.textContent) + 1}`;
});

canvas.addEventListener("pointerenter", play);
canvas.addEventListener("pointerleave", pause);
