uniform sampler2D uInputTexture;
uniform float uTexelSizeMultiplier;

in vec2 aPosition;
out vec2 vTexelSize;
out vec2 vUv;

void main() {
  vTexelSize = uTexelSizeMultiplier / vec2(textureSize(uInputTexture, 0).xy);
  vUv = aPosition.xy * 0.5 + 0.5;
  gl_Position = vec4(aPosition.xy, 1.0, 1.0);
}
