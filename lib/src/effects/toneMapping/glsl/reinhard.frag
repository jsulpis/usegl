#include "./_common.glsl"

uniform float uWhitePoint;

// Reinhard tonemapping extended with white point

vec3 toneMapping(vec3 color) {
  vec3 mapped = color.rgb / (1.0 + color.rgb);

  if (uWhitePoint > 1.0) {
    vec3 whiteSq = vec3(uWhitePoint * uWhitePoint);
    mapped = (color.rgb * (1.0 + color.rgb / whiteSq)) / (1.0 + color.rgb);
  }
  return mapped;
}

#include "./_main.glsl"
