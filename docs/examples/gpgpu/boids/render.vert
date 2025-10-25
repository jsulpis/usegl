uniform sampler2D tPositions;
uniform sampler2D tVelocities;
attribute vec2 aCoords;
varying vec4 vColor;
varying mat2 vRotation;

#define PI acos(-1.)

void main() {
  vec2 position = texture2D(tPositions, aCoords).xy;
  vec2 velocity = texture2D(tVelocities, aCoords).xy;

  vec2 orientation = normalize(velocity.xy);
  float angle = atan(orientation.y, orientation.x) - PI / 2.;
  vRotation = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));

  if(aCoords == vec2(0)) {
    // predator
    vColor = vec4(1, 0, 0, 1);
    gl_PointSize = 40.0;
  } else {
    // boid
    vec2 predatorPosition = texture2D(tPositions, vec2(0)).xy;
    float distance = length(position - predatorPosition);
    vColor = mix(vec4(1, .5, 0, 1), vec4(0, .8, 1, 1), smoothstep(0.2, .8, distance));
    vColor.rgb = mix(vColor.rgb, vec3(0), smoothstep(.6, 2., distance));
    gl_PointSize = 30.0;
  }

  gl_Position = vec4(position, 0, 1);
}
