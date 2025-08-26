#include "./_common.glsl"

// Uncharted 2 filmic curve by John Hable
// http://filmicworlds.com/blog/filmic-tonemapping-operators/

const float A = 0.15;
const float B = 0.50;
const float C = 0.10;
const float D = 0.20;
const float E = 0.02;
const float F = 0.30;
const float W = 11.2;
const float exposureBias = 2.0;

vec3 uncharted2Tonemap(vec3 x) {
  return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F)) - E/F;
}

vec3 toneMapping(vec3 color) {
  vec3 mapped = uncharted2Tonemap(exposureBias * color);
  vec3 whiteScale = 1.0 / uncharted2Tonemap(vec3(W));
  return mapped * whiteScale;
}

#include "./_main.glsl"
