uniform sampler2D uBaseImage;
uniform sampler2D uBloomTexture;
uniform vec2 uResolution;
uniform float uMix;

in vec2 vUv;
out vec4 outColor;

vec2 offset(float octave) {
  vec2 padding = 10.0 / uResolution;
  float octaveFloor = min(1.0, floor(octave / 3.0));
  vec2 offset = vec2(
    -octaveFloor * (0.25 + padding.x),
    -(1.0 - (1.0 / exp2(octave))) - padding.y * octave + octaveFloor * (0.35 + padding.y)
  );
  return offset + 0.5 / uResolution;
}

vec3 blurredMipmapLevel(float octave) {
  vec2 offset = offset(octave - 1.0);
  return texture(uBloomTexture, vUv / exp2(octave) - offset).rgb;
}

vec3 bloomColor() {
  return blurredMipmapLevel(1.0) * 0.8
       + blurredMipmapLevel(3.0) * 0.5
       + blurredMipmapLevel(4.0) * 1.2;
}

void main() {
  vec4 baseColor = texture(uBaseImage, vUv);
  float baseColorGreyscale = dot(baseColor.rgb, vec3(0.299, 0.587, 0.114));
  float mixFactor = (1.0 - baseColorGreyscale * baseColor.a) * uMix;

  vec4 combinedColor = baseColor;
  combinedColor.rgb += bloomColor() * mixFactor;

  outColor = combinedColor;
}
