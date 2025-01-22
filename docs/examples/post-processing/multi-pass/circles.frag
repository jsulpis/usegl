uniform float uTime;
in vec2 vUv;
out vec4 outColor;

float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

vec3 drawCircle(vec2 pos, float radius, vec3 color) {
  return smoothstep(radius * 1.01, radius * .99, sdCircle(pos, radius)) * color;
}

void main() {
  vec3 color = vec3(0, 0.07, 0.15);
  color += drawCircle(vUv - vec2(.4), .1 * (1. + sin(uTime/2.)/10.), vec3(vUv, 1.));
  color += drawCircle(vUv - vec2(.65, .65), .015  * (1. + sin(uTime/2.-1.5)/4.), vec3(vUv, 1.));
  color += drawCircle(vUv - vec2(.75, .4), .04  * (1. + sin(uTime/2.-1.)/4.), vec3(vUv, 1.));
  outColor = vec4(color, 1.);
}
