import { loadTexture, useWebGLCanvas } from "usegl";
import "./styles.css";

(async () => {
  const texture = await loadTexture("https://picsum.photos/id/669/600/400");

  useWebGLCanvas({
    canvas: "#glCanvas",
    fragment: /* glsl */ `
      in vec2 vUv;
      uniform sampler2D uTexture;
      uniform vec2 uResolution;
      out vec4 fragColor;

      #define CONTAIN 1
      #define COVER 2
      #define OBJECT_FIT CONTAIN

      void main() {
        vec2 textureResolution = vec2(textureSize(uTexture, 0));
        float canvasRatio = uResolution.x / uResolution.y;
        float textureRatio = textureResolution.x / textureResolution.y;

        vec2 uv = vUv - 0.5;
        if (OBJECT_FIT == CONTAIN ? canvasRatio > textureRatio : canvasRatio < textureRatio) {
          uv.x *= canvasRatio / textureRatio;
        } else {
          uv.y *= textureRatio / canvasRatio;
        }
        uv += 0.5;

        vec3 color = texture(uTexture, uv).rgb;
        color *= step(0., uv.x) * (1. - step(1., uv.x));
        color *= step(0., uv.y) * (1. - step(1., uv.y));

        fragColor = vec4(color, 1.);
      }
    `,
    uniforms: {
      uTexture: texture,
    },
  });
})();
