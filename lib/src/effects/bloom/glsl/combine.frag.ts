export const combineFragment = /* glsl */ `
  uniform sampler2D uImage;
  uniform sampler2D uBloomTexture;
  uniform float uMix;

  in vec2 vUv;
  out vec4 outColor;

  void main() {
    vec4 baseColor = texture(uImage, vUv);
    vec4 bloomColor = texture(uBloomTexture, vUv);

    outColor = max(baseColor, mix(baseColor, bloomColor, uMix));
  }
`;
