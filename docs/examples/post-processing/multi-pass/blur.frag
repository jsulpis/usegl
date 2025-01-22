uniform sampler2D uImage;
uniform vec2 uResolution;
uniform vec2 uDirection;
in vec2 vUv;
out vec4 outColor;

const float weights[5] = float[](0.19638062, 0.29675293, 0.09442139, 0.01037598, 0.00025940);
const float offsets[5] = float[](0.0, 1.41176471, 3.29411765, 5.17647059, 7.05882353);

void main() {
  vec3 color = texture(uImage, vUv).rgb * weights[0];
  float weightSum = weights[0];

  if (vUv.x < 0.52) {
    for(int i = 1; i < 5; i++) {
      vec2 offset = (offsets[i] / uResolution) * 0.5 * uDirection;
      color += texture(uImage, vUv + offset).rgb * weights[i];
      color += texture(uImage, vUv - offset).rgb * weights[i];
      weightSum += 2.0 * weights[i];
    }
    color /= weightSum;
  }

  outColor = vec4(color, 1.0);
}
