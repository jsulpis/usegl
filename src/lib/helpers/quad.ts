export const quadVertexShaderSource = /*glsl*/ `#version 300 es

in vec2 aPosition;
out vec2 vUv;

void main() {
   gl_Position = vec4(aPosition, 0.0, 1.0);
   vUv = (aPosition + 1.0) / 2.0;
}
`;

export const quadVertexPositions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
