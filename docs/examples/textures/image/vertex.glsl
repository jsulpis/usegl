attribute vec2 position;
attribute vec2 uv;
uniform sampler2D uTexture;
uniform vec2 uResolution;
varying vec2 vUv;

#define CONTAIN 1
#define COVER 2
#define OBJECT_FIT CONTAIN

void main() {
  vec2 textureResolution = vec2(textureSize(uTexture, 0));
  float canvasRatio = uResolution.x / uResolution.y;
  float textureRatio = textureResolution.x / textureResolution.y;

  vUv = position;
  if(OBJECT_FIT == CONTAIN ? canvasRatio > textureRatio : canvasRatio < textureRatio) {
    vUv.x *= canvasRatio / textureRatio;
  } else {
    vUv.y *= textureRatio / canvasRatio;
  }
  vUv = (vUv + 1.0) / 2.0;
  gl_Position = vec4(position, 0.0, 1.0);
}
