void main() {
  vec4 color = texture(uTexture, vUv);
  color.rgb *= uExposure;
  color.rgb = color.a == 0.0 ? vec3(0.0) : color.rgb / color.a; // premultiplied -> straight alpha

  color.rgb = toneMapping(color.rgb);

  color.rgb *= color.a; // back to premultiplied alpha
  color = clamp(color, 0.0, 1.0);

  if (uConvertToSRGB) {
    color = linearToSRGB(color);
  }

  gl_FragColor = color;
}
