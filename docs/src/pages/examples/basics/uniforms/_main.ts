import { useWebGLCanvas } from "usegl";
import { Pane } from "tweakpane";
import "./styles.css";

const { uniforms } = useWebGLCanvas({
  canvas: "#glCanvas",
  fragment: /* glsl */ `
    varying vec2 vUv;
    uniform float uRadius;
    uniform float uSize;
    uniform float uRotation;
    uniform vec2 uPosition;

    mat2 rotateZ(float angle) {
      return mat2(cos(angle), sin(angle), -sin(angle), cos(angle));
    }

    // https://iquilezles.org/articles/distfunctions2d/
    float sdRoundedBox( in vec2 p, in vec2 b, in vec4 r ) {
      r.xy = (p.x>0.0)?r.xy : r.zw;
      r.x  = (p.y>0.0)?r.x  : r.y;
      vec2 q = abs(p)-b+r.x;
      return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
    }

    void main() {
      vec2 p = (vUv - uPosition) * rotateZ(uRotation);
      vec4 radius = vec4(min(uRadius, uSize));
      float squareDist = sdRoundedBox(p, vec2(uSize), radius);
      float squareMask = 1. - smoothstep(-.001, .001, squareDist);

      float gradient = length(p + uSize) / (2. * uSize * sqrt(2.));
      vec3 color = mix(
        vec3(0.1, 0.2, 0.4), // dark blue
        vec3(0.41, 0.84, 0.98), // light blue
        gradient
      ) * squareMask;

      gl_FragColor = vec4(color, 1.0);
    }
  `,
  uniforms: {
    uRadius: 0.03,
    uSize: 0.2,
    uRotation: 0.1,
    uPosition: [0.5, 0.5],
  },
});

const pane = new Pane({ title: "Uniforms" });

// updating the uniforms object will trigger a re-render
pane.addBinding(uniforms, "uSize", { min: 0.01, max: 0.3 });
pane.addBinding(uniforms, "uRadius", { min: 0.01, max: 0.2 });
pane.addBinding(uniforms, "uRotation", { min: 0, max: 2 * Math.PI });

pane
  .addBinding({ uPosition: { x: 0.5, y: 0.5 } }, "uPosition", {
    x: { min: -1, max: 1 },
    y: { min: -1, max: 1 },
  })
  .on("change", (e) => {
    // uniforms.uPosition is typed : [number, number]
    uniforms.uPosition = [e.value.x / 2 + 0.5, -e.value.y / 2 + 0.5];
  });
