export const fragment = /*glsl*/ `
  in vec2 vUv;
  uniform sampler2D uTexture;

  float sdCircle(vec2 p, float r) {
    return length(p) - r;
  }

  vec3 drawCircle(vec2 pos, float radius, vec3 color) {
    return smoothstep(radius * 1.01, radius * .99, sdCircle(pos, radius)) * color;
  }

  void main() {
    // circles
    vec3 color = vec3(0, 0.02, 0.06);
    color += drawCircle(vUv - vec2(.4), .1, vec3(vUv, 1.));
    color += drawCircle(vUv - vec2(.5, .68), .003, vec3(vUv, 1.));
    color += drawCircle(vUv - vec2(.66, .6), .015, vec3(vUv, 1.));
    color += drawCircle(vUv - vec2(.75, .4), .03, vec3(vUv, 1.));
    gl_FragColor.rgba = vec4(color * 1.5, 1.);
    gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(2.2));

    // grid of dots
    // vec2 center = vec2(0.5, 0.5);
    // vec2 size = vec2(0.05); // Half the size of each small square
    // vec2 gridSize = vec2(10.0); // Number of squares in each dimension

    // vec2 gridPos = floor(vUv * gridSize);
    // vec2 gridUv = fract(vUv * gridSize);

    // vec2 dist = abs(gridUv - center);

    // if (dist.x < size.x && dist.y < size.y) {
    //   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White square
    // } else {
    //   gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black background
    // }
    // gl_FragColor = vec4(vec3(1. - step(size.x, length(gridUv - center))), 1.);

    // image texture
    // gl_FragColor.rgba = texture(uTexture, vUv);
  }
`;
