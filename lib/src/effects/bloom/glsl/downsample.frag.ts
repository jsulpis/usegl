export const downSampleFragment = /* glsl */ `
  uniform sampler2D uInputTexture;

  in vec2 vUv;
  in vec2 vTexelSize;
  out vec4 fragColor;

  void main() {
    vec2 offsets[13] = vec2[](
      vec2(-1.0,  1.0), vec2( 1.0,  1.0),
      vec2(-1.0, -1.0), vec2( 1.0, -1.0),
      vec2(-2.0,  2.0), vec2( 0.0,  2.0), vec2( 2.0,  2.0),
      vec2(-2.0,  0.0), vec2( 0.0,  0.0), vec2( 2.0,  0.0),
      vec2(-2.0, -2.0), vec2( 0.0, -2.0), vec2( 2.0, -2.0)
    );

    float weights[13] = float[](
      // 4 corners
      0.125, 0.125,
      0.125, 0.125,
      // 9 center
      0.0555555, 0.0555555, 0.0555555,
      0.0555555, 0.0555555, 0.0555555,
      0.0555555, 0.0555555, 0.0555555
    );

    vec4 color = vec4(0.0);

    for (int i = 0; i < 13; i++) {
      vec2 sampleUv = vUv + offsets[i] * vTexelSize;
      color += weights[i] * texture(uInputTexture, sampleUv);
    }

    fragColor = color;
  }
`;
