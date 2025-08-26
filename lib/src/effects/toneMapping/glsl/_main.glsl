void main() {
  vec4 color = texture(uTexture, vUv) * uExposure;
  color.rgb = toneMapping(color.rgb);
  gl_FragColor = clamp(color, 0.0, 1.0);
}
