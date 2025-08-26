void main() {
  vec4 color = texture(uTexture, vUv) * uExposure;
  color.rgb = toneMapping(color.rgb);
  color = clamp(color, 0.0, 1.0);

  if (uConvertToSRGB) {
    color = linearToSRGB(color);
  }

  gl_FragColor = color;
}
