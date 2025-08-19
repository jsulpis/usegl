uniform sampler2D uBaseImage;
uniform sampler2D uBloomTexture;
uniform vec2 uResolution;
uniform float uMix;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec4 baseColor = texture(uBaseImage, vUv);
  vec4 bloomColor = texture(uBloomTexture, vUv);

  outColor = max(baseColor, mix(baseColor, bloomColor, uMix));
}
