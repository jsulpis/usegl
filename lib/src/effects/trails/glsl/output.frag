varying vec2 vUv;
uniform sampler2D uTrailTexture;

void main() {
  gl_FragColor = texture2D(uTrailTexture, vUv);
}
