uniform sampler2D uTexture;
uniform float uExposure;
uniform bool uConvertToSRGB;

varying vec2 vUv;

vec4 linearToSRGB(vec4 color) {
  return vec4(
    mix(
      color.rgb * 12.92,
      pow(color.rgb, vec3(1.0 / 2.4)) * 1.055 - 0.055,
      step(vec3(0.0031308), color.rgb)
    ),
    color.a
  );
}
