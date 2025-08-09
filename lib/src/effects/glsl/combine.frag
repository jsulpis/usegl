uniform sampler2D uImage;
uniform sampler2D uBloomTexture;
uniform float uMix;

in vec2 vUv;
out vec4 outColor;

vec3 linearToSrgb(vec3 color) {
  vec3 a = 12.92 * color;
  vec3 b = 1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055;
  vec3 cond = step(vec3(0.0031308), color);
  return mix(a, b, cond);
}

void main() {
  vec4 baseColor = texture(uImage, vUv);
  vec4 bloomColor = texture(uBloomTexture, vUv);

  outColor = max(baseColor, mix(baseColor, bloomColor, uMix));

  outColor.rgb = linearToSrgb(outColor.rgb);
}
