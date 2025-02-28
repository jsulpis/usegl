varying vec4 vColor;
varying mat2 vRotation;

// https://iquilezles.org/articles/distfunctions2d/
float sdUnevenCapsule( vec2 p, float r1, float r2, float h ) {
  p.x = abs(p.x);
  float b = (r1-r2)/h;
  float a = sqrt(1.0-b*b);
  float k = dot(p,vec2(-b,a));
  if( k < 0.0 ) return length(p) - r1;
  if( k > a*h ) return length(p-vec2(0.0,h)) - r2;
  return dot(p, vec2(a,b) ) - r1;
}

void main() {
  vec2 uv = vRotation * (gl_PointCoord.xy - .5);

  float h = .4;
  float r1 = .12;
  float r2 = .28;
  float offset = (h + r1) / 2.;
  float capsuleDist = sdUnevenCapsule(uv + vec2(0., offset), r1, r2, h);

  vec4 color = vColor;
  color.a *= 1. - step(0., capsuleDist);

  gl_FragColor = color;
}
