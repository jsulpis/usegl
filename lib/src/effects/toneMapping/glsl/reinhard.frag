uniform sampler2D uTexture;
uniform float uExposure;
uniform float uWhitePoint;

varying vec2 vUv;

// Reinhard tonemapping extended with white point

vec3 ReinhardToneMapping(vec3 color) {
  vec3 mapped = color.rgb / (1.0 + color.rgb);

  if (uWhitePoint > 1.0) {
    vec3 whiteSq = vec3(uWhitePoint * uWhitePoint);
    mapped = (color.rgb * (1.0 + color.rgb / whiteSq)) / (1.0 + color.rgb);
  }
  return mapped;
}

void main() {
  vec4 color = texture(uTexture, vUv) * uExposure;
  color.rgb = ReinhardToneMapping(color.rgb);
  gl_FragColor = clamp(color, 0.0, 1.0);
}
