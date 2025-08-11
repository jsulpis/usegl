uniform sampler2D uCurrentTexture;  // Texture at the current (higher) resolution
uniform sampler2D uPreviousTexture; // Texture at the lower (blurrier) resolution
uniform float uRadius;              // Interpolation factor

in vec2 vTexelSize;
in vec2 vUv;
out vec4 fragColor;

float clampToBorder(const in vec2 uv) {
  return (uv.s >= 0.0 && uv.s <= 1.0 && uv.t >= 0.0 && uv.t <= 1.0) ? 1.0 : 0.5;
}

void main() {
  vec2 offsets[9] = vec2[](
    vec2(-1.0,  1.0), vec2( 0.0,  1.0), vec2( 1.0,  1.0),
    vec2(-1.0,  0.0), vec2( 0.0,  0.0), vec2( 1.0,  0.0),
    vec2(-1.0, -1.0), vec2( 0.0, -1.0), vec2( 1.0, -1.0)
  );
  float weights[9] = float[](
    0.0625, 0.125, 0.0625,
    0.125,  0.25,  0.125,
    0.0625, 0.125, 0.0625
  );

  vec4 prevColor = vec4(0.0);
  for (int i = 0; i < 9; i++) {
    vec2 sampleUv = vUv + offsets[i] * vTexelSize;
    prevColor += weights[i] * clampToBorder(sampleUv) * texture(uPreviousTexture, sampleUv);
  }

  vec4 currColor = texture(uCurrentTexture, vUv);

  fragColor = max(currColor, mix(currColor, prevColor, uRadius));
}


