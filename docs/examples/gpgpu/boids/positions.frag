uniform sampler2D tPositions;
uniform sampler2D tVelocities;
uniform float uDeltaTime;

varying vec2 uv;

void main() {
  vec2 position = texture(tPositions, uv).xy;
  vec2 velocity = texture(tVelocities, uv).xy;

  position += velocity * uDeltaTime;

  gl_FragColor = vec4(position, 0.0, 1.0);
}
