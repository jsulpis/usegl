#include "./_common.glsl"

const float startCompression = 0.8 - 0.04;
const float desaturation = 0.15;

// Khronos PBR Neutral
// https://modelviewer.dev/examples/tone-mapping

vec3 toneMapping( vec3 color ) {
  float x = min(color.r, min(color.g, color.b));
  float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
  color -= offset;

  float peak = max(color.r, max(color.g, color.b));
  if (peak < startCompression) return color;

  float d = 1. - startCompression;
  float newPeak = 1. - d * d / (peak + d - startCompression);
  color *= newPeak / peak;

  float g = 1. - 1. / (desaturation * (peak - newPeak) + 1.);
  return mix(color, newPeak * vec3(1, 1, 1), g);
}

#include "./_main.glsl"
