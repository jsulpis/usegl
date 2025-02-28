uniform sampler2D tPositions;
uniform sampler2D tVelocities;
uniform float uDeltaTime;

uniform float uMaxSpeed;
uniform float uPerceptionRadius;

uniform float uSeparationWeight;
uniform float uAlignmentWeight;
uniform float uCohesionWeight;

uniform float uBorderForce;
uniform float uBorderDistance;

uniform float uPredatorRepulsionStrength;
uniform float uPredatorRepulsionRadius;

varying vec2 uv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 flockingForces(vec2 position, vec2 velocity) {
  vec2 texSize = vec2(textureSize(tVelocities, 0));
  vec2 separation = vec2(0.0);
  vec2 alignment = vec2(0.0);
  vec2 cohesion = vec2(0.0);
  int count = 0;

  // Accumulate forces from neighbors
  for(float y = 1.0; y < texSize.y; y++) {
    for(float x = 1.0; x < texSize.x; x++) {
      vec2 neighborUV = vec2(x, y) / texSize;
      if(neighborUV == uv) continue;

      vec2 neighborPos = texture2D(tPositions, neighborUV).xy;
      vec2 neighborVel = texture2D(tVelocities, neighborUV).xy;
      float dist = distance(position, neighborPos);

      if(dist < uPerceptionRadius && dist > 0.0) {
        separation += normalize(position - neighborPos) * (1.0 - dist/uPerceptionRadius);
        alignment += neighborVel;
        cohesion += neighborPos;
        count++;
      }
    }
  }

  if(count > 0) {
    separation = normalize(separation) * uSeparationWeight;
    alignment = normalize(alignment/float(count)) * uAlignmentWeight;
    cohesion = normalize((cohesion/float(count)) - position) * uCohesionWeight;
  }
  return separation + alignment + cohesion;
}

vec2 borderRepulsion(vec2 position) {
  vec2 distToBorder = vec2(1.0 - abs(position.x), 1.0 - abs(position.y));
  vec2 force = vec2(0.0);

  if(distToBorder.x < uBorderDistance) {
    force.x = (uBorderDistance - distToBorder.x) / uBorderDistance * -sign(position.x);
  }
  if(distToBorder.y < uBorderDistance) {
    force.y = (uBorderDistance - distToBorder.y) / uBorderDistance * -sign(position.y);
  }
  return force * uBorderForce;
}

vec2 randomWandering(vec2 position, vec2 velocity) {
  float rand = random(position.xy) * 2.0 - 1.0;
  float angle = rand * radians(10.0);
  mat2 rotationMatrix = mat2(
    cos(angle), -sin(angle),
    sin(angle), cos(angle)
  );
  return normalize(rotationMatrix * velocity) * 5.;
}

vec2 predatorRepulsion(vec2 position, vec2 velocity) {
  vec2 predatorPos = texture2D(tPositions, vec2(0.0)).xy;
  vec2 toPredator = predatorPos - position;
  float predatorDist = length(toPredator);

  if (predatorDist < uPredatorRepulsionRadius) {
    return normalize(-1. * toPredator) * uPredatorRepulsionStrength * (1.0 - predatorDist / uPredatorRepulsionRadius);
  }
  return vec2(0.0);
}

void main() {
  vec2 position = texture2D(tPositions, uv).xy;
  vec2 velocity = texture2D(tVelocities, uv).xy;
  vec2 acceleration = borderRepulsion(position);

  bool isPredator = floor(gl_FragCoord.xy) == vec2(0.0);

  if (isPredator) {
    acceleration += randomWandering(position, velocity);
  } else {
    acceleration += flockingForces(position, velocity) + predatorRepulsion(position, velocity);
  }
  velocity += acceleration * uDeltaTime;

  float speedLimit = isPredator ? uMaxSpeed / 2.0 : uMaxSpeed;
  if(length(velocity) > speedLimit) {
    velocity = normalize(velocity) * speedLimit;
  }

  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
