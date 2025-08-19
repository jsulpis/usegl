uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uDirection;
uniform float uRadius;

in vec2 vUv;
out vec4 outColor;

/*
* Directional Gaussian Blur
* /!\ Absolutely not optimized, for demonstration purposes only
*/

void main() {
  float sigma = float(uRadius / 2.);
  vec2 sampleOffset = uDirection / uResolution;

  // Build normalized Gaussian weights
  float weights[51];
  weights[0] = 1.0;
  float sum = weights[0];
  for (int i = 1; i <= int(uRadius); ++i) {
    float x = float(i);
    float w = exp(-0.5 * (x * x) / (sigma * sigma));
    weights[i] = w;
    sum += 2.0 * w;
  }
  for (int i = 0; i <= int(uRadius); ++i) {
    weights[i] /= sum;
  }

  vec3 color = texture(uTexture, vUv).rgb * weights[0];
  for (int i = 1; i <= int(uRadius); ++i) {
    float fi = float(i);
    color += texture(uTexture, vUv + sampleOffset * fi).rgb * weights[i];
    color += texture(uTexture, vUv - sampleOffset * fi).rgb * weights[i];
  }

  outColor = vec4(color, 1.0);
}
