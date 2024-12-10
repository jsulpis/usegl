import { loadTexture, useWebGLCanvas } from "usegl";
import "./styles.css";

const vertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  varying vec2 vUv;

  #define CONTAIN 1
  #define COVER 2
  #define OBJECT_FIT CONTAIN

  void main() {
    vec2 textureResolution = vec2(textureSize(uTexture, 0));
    float canvasRatio = uResolution.x / uResolution.y;
    float textureRatio = textureResolution.x / textureResolution.y;

    vUv = position;
    if (OBJECT_FIT == CONTAIN ? canvasRatio > textureRatio : canvasRatio < textureRatio) {
      vUv.x *= canvasRatio / textureRatio;
    } else {
      vUv.y *= textureRatio / canvasRatio;
    }
    vUv = (vUv + 1.0) / 2.0;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTexture;

  void main() {
    vec3 color = texture(uTexture, vUv).rgb;
    color *= step(0., vUv.x) * (1. - step(1., vUv.x));
    color *= step(0., vUv.y) * (1. - step(1., vUv.y));

    gl_FragColor = vec4(color, 1.);
  }
`;

(async () => {
  const texture = await loadTexture("https://picsum.photos/id/669/600/400");

  useWebGLCanvas({
    canvas: "#glCanvas",
    vertex,
    fragment,
    uniforms: {
      uTexture: texture,
    },
  });
})();
