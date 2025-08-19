in vec2 vUv;
out vec4 outColor;

vec3 drawCircle(vec2 pos, float radius, vec3 color) {
  return smoothstep(radius * 1.03, radius * .97, (length(pos) - radius)) * color;
}

void main() {
  vec2 c = vec2(0.5, 0.5);
  float R = 0.15;
  float s60 = 0.86602540378; // sqrt(3)/2

  vec2 pTop = c + vec2(0.0, R);
  vec2 pBL  = c + vec2(-R * s60, -R * 0.5);
  vec2 pBR  = c + vec2( R * s60, -R * 0.5);

  vec3 color = vec3(0.0);
  float r = 0.10;

  color += drawCircle(vUv - pTop, r, vec3(1.0, 0.0, 0.0));
  color += drawCircle(vUv - pBL,  r, vec3(0.0, 1.0, 0.0));
  color += drawCircle(vUv - pBR,  r, vec3(0.0, 0.0, 1.0));

  outColor = vec4(color, 1.0);
}
