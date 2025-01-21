import { useEffectPass, useWebGLCanvas, loadTexture } from "usegl";
import { Pane } from "tweakpane";
import "./styles.css";

const image = loadTexture("https://picsum.photos/id/323/600/400");

const sepiaEffect = useEffectPass({
  fragment: /* glsl */ `
    uniform sampler2D uTexture; // output of the render pass
    uniform float uStrength;
    in vec2 vUv;
    out vec4 fragColor;

    #define SEPIA_COLOR vec3(1.2, 1.0, 0.7)

    vec3 sepia(vec3 color) {
      float grayScale = dot(color, vec3(0.299, 0.587, 0.114));
      return grayScale * SEPIA_COLOR;
    }

    void main() {
      vec3 color = texture(uTexture, vUv).rgb;
      color = mix(color, sepia(color), uStrength);
      fragColor = vec4(color, 1.);
    }
  `,
  uniforms: {
    uStrength: 0.75,
  },
});

const { onAfterRender } = useWebGLCanvas({
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
    uPicture: image,
  },
  postEffects: [sepiaEffect],
});

const renderCount = document.querySelector("#renderCount");
onAfterRender(() => {
  renderCount.textContent = `${Number(renderCount.textContent) + 1}`;
});

// You can update the uniforms of an effect pass
const pane = new Pane({ title: "Uniforms" });
pane.addBinding(sepiaEffect.uniforms, "uStrength", { min: 0, max: 1 });
