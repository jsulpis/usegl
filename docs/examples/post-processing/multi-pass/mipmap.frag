uniform sampler2D uImage;
uniform vec2 uResolution;
uniform float uThreshold;

in vec2 vUv;
out vec4 outColor;

vec2 offset(float octave) {
  vec2 padding = 10.0 / uResolution;
  float octaveFloor = min(1.0, floor(octave / 3.0));
  return vec2(
    -octaveFloor * (0.25 + padding.x),
    -(1.0 - (1.0 / exp2(octave))) - padding.y * octave + octaveFloor * (0.35 + padding.y)
  );
}

vec3 mipmapLevel(float octave) {
  float scale = exp2(octave);
  vec2 coord = (vUv + offset(octave - 1.0)) * scale;

  if (any(lessThan(coord, vec2(0.0))) || any(greaterThan(coord, vec2(1.0)))) {
    return vec3(0.0);
  }

  vec3 color = vec3(0.0);
  int spread = int(scale);

  for (int i = 0; i < spread; i++) {
    for (int j = 0; j < spread; j++) {
      vec2 offset = (vec2(i, j) / uResolution) * scale / float(spread);
      vec3 imageColor = texture(uImage, coord + offset).rgb;
      color += max(vec3(0.0), imageColor - vec3(uThreshold));
    }
  }

  return color / float(spread * spread);
}

void main() {
  outColor = vec4(mipmapLevel(1.0) + mipmapLevel(3.0) + mipmapLevel(4.0), 1.0);
}
