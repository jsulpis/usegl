varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
  vec3 color = texture(uTexture, vUv).rgb;
  color *= step(0., vUv.x) * (1. - step(1., vUv.x));
  color *= step(0., vUv.y) * (1. - step(1., vUv.y));

  gl_FragColor = vec4(color, 1.);
}
