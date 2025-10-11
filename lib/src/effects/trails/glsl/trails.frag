varying vec2 vUv;

uniform sampler2D uRenderTexture;
uniform sampler2D uPreviousTrailTexture;

uniform vec4 uTailColor;
uniform float uTailColorFalloff;
uniform float uFadeout;
uniform vec2 uKernelSize;

const vec3 luminanceWeights = vec3(0.2126, 0.7152, 0.0722);

void main() {
  vec4 renderColor = texture2D(uRenderTexture, vUv);
  vec4 previousColor = texture2D(uPreviousTrailTexture, vUv);

  vec4 localMinimum = previousColor;
  if (uKernelSize.x > 0.0 || uKernelSize.y > 0.0) {
    localMinimum = min(localMinimum, texture2D(uPreviousTrailTexture, vUv + vec2(0.0, uKernelSize.y)));
    localMinimum = min(localMinimum, texture2D(uPreviousTrailTexture, vUv + vec2(uKernelSize.x, uKernelSize.y)));
    localMinimum = min(localMinimum, texture2D(uPreviousTrailTexture, vUv + vec2(uKernelSize.x, 0.0)));
    localMinimum = min(localMinimum, texture2D(uPreviousTrailTexture, vUv + vec2(uKernelSize.x, -uKernelSize.y)));
    localMinimum = min(localMinimum, texture2D(uPreviousTrailTexture, vUv + vec2(0.0, -uKernelSize.y)));
    localMinimum = min(localMinimum, texture2D(uPreviousTrailTexture, vUv + vec2(-uKernelSize.x, -uKernelSize.y)));
    localMinimum = min(localMinimum, texture2D(uPreviousTrailTexture, vUv + vec2(-uKernelSize.x, 0.0)));
    localMinimum = min(localMinimum, texture2D(uPreviousTrailTexture, vUv + vec2(-uKernelSize.x, uKernelSize.y)));
  }

  float minimumLuminance = dot(localMinimum.rgb, luminanceWeights);
  vec4 trailColor = previousColor * .999;// mix(localMinimum, uTailColor, uTailColorFalloff * minimumLuminance);
  // trailColor.a *= 0.;
  // trailColor = vec4(1., 0., 0., 0.1);

  // alpha over
  gl_FragColor.a = renderColor.a + trailColor.a * (1.0 - renderColor.a);
  gl_FragColor.rgb = (renderColor.rgb * renderColor.a + trailColor.rgb * trailColor.a * (1.0 - renderColor.a));

  // gl_FragColor = mix(renderColor, max(renderColor, trailColor * (1.0 - uFadeout)), 1.);
}
