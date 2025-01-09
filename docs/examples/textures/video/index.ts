import { loadVideoTexture, useLoop, useWebGLCanvas } from "usegl";
import "./styles.css";

const canvas = document.querySelector("canvas");

(async () => {
  const texture = await loadVideoTexture(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  );

  const videoElement = texture.src as HTMLVideoElement;
  canvas.style.aspectRatio = `${videoElement.videoWidth} / ${videoElement.videoHeight}`;

  const { render } = useWebGLCanvas({
    canvas,
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
      uTexture: texture,
    },
  });

  useLoop(render);
})();
