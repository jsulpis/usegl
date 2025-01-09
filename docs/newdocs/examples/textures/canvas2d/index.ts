import { useWebGLCanvas } from "usegl";
import "./styles.css";

const canvas2d = drawIn2dCanvas();

const webglCanvas = document.querySelector("canvas")!;
// don't forget to make the content accessible !
webglCanvas.ariaLabel = "TEXT rendered in a 2D canvas";

useWebGLCanvas({
  canvas: webglCanvas,
  fragment: /* glsl */ `
    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main() {
      gl_FragColor = texture(uTexture, vUv);
    }
  `,
  uniforms: {
    uTexture: {
      src: canvas2d,
    },
  },
});

function drawIn2dCanvas() {
  const canvas2d = document.createElement("canvas");
  const SIZE = 1024;
  canvas2d.width = canvas2d.height = SIZE;
  const ctx = canvas2d.getContext("2d", { alpha: false })!;

  ctx.fillStyle = "#012";
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, 300, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "100px sans-serif";
  ctx.fillText("TEXT", SIZE / 2, SIZE / 2);
  ctx.font = "40px sans-serif";
  ctx.fillText("rendered in a 2D canvas", SIZE / 2, SIZE / 2 + 60);

  return canvas2d;
}
