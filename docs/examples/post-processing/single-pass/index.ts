import { useEffectPass, useWebGLCanvas, loadTexture } from "usegl";
import "./styles.css";

(async () => {
  const sepiaEffect = useEffectPass({
    fragment: /* glsl */ `
      uniform sampler2D uTexture; // output of the render pass
      in vec2 vUv;
      out vec4 fragColor;

      #define SEPIA_COLOR vec3(1.2, 1.0, 0.7)
      #define STRENGTH .75

      vec3 sepia(vec3 color) {
        float grayScale = dot(color, vec3(0.299, 0.587, 0.114));
        return grayScale * SEPIA_COLOR;
      }

      void main() {
        vec3 color = texture(uTexture, vUv).rgb;
        color = mix(color, sepia(color), STRENGTH);
        fragColor = vec4(color, 1.);
      }
    `,
  });

  useWebGLCanvas({
    canvas: "#glCanvas",
    fragment: /* glsl */ `
      in vec2 vUv;
      uniform sampler2D uPicture;
      out vec4 fragColor;

      void main() {
        fragColor = texture(uPicture, vUv);
      }
    `,
    uniforms: {
      uPicture: await loadTexture("https://picsum.photos/id/323/600/400"),
    },
    postEffects: [sepiaEffect],
  });
})();
