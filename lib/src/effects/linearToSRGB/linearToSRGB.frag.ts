export const linearToSRGBFragment = /* glsl */ `
  uniform sampler2D uTexture;
  varying vec2 vUv;

  void main() {
    vec4 color = texture(uTexture, vUv);
    gl_FragColor = vec4(
      mix(
        color.rgb * 12.92,
        pow(color.rgb, vec3(1.0 / 2.4)) * 1.055 - 0.055,
        step(vec3(0.0031308), color.rgb)
      ),
      color.a
    );
  }
`;
