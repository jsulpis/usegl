import { useWebGLCanvas } from "usegl";
import "./styles.css";

const canvasTexture = document.createElement("canvas");
const SIZE = 1024;
canvasTexture.width = canvasTexture.height = SIZE;
const ctx = canvasTexture.getContext("2d", { alpha: false })!;

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
      src: canvasTexture,
    },
  },
});
