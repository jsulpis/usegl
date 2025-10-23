varying vec2 vUv;

uniform sampler2D uRenderTexture;
uniform sampler2D uPreviousTrailTexture;

uniform vec4 uTailColor;
uniform float uTailColorFalloff;
uniform float uFadeout;
uniform vec2 uKernelSize;

void main() {
  vec4 renderColor = texture2D(uRenderTexture, vUv);
  vec4 previousColor = texture2D(uPreviousTrailTexture, vUv);

  vec4 trailColor = previousColor;

  // erosion
  if (uKernelSize.x > 0.0 || uKernelSize.y > 0.0) {
    trailColor = min(trailColor, texture2D(uPreviousTrailTexture, vUv + vec2(0.0, uKernelSize.y)));
    trailColor = min(trailColor, texture2D(uPreviousTrailTexture, vUv + vec2(uKernelSize.x, 0.0)));
    trailColor = min(trailColor, texture2D(uPreviousTrailTexture, vUv + vec2(0.0, -uKernelSize.y)));
    trailColor = min(trailColor, texture2D(uPreviousTrailTexture, vUv + vec2(-uKernelSize.x, 0.0)));
  }

  // blend with a tail color
  if (uTailColorFalloff > 0.) {
    float blending = pow(uTailColorFalloff, 3.) * trailColor.a;
    blending *= smoothstep(0., 1., distance(previousColor.rgb, renderColor.rgb));
    trailColor.rgb = mix(trailColor.rgb, uTailColor.rgb, blending);
  }

  // fadeout
  trailColor *= (1. - pow(uFadeout, 2.));

  // lighten blend
  gl_FragColor = max(renderColor, trailColor);
}
