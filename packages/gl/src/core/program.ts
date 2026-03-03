import { createShader } from "./shader";

export function createProgram(
  gl: WebGL2RenderingContext,
  fragment: string | WebGLShader,
  vertex: string | WebGLShader,
  transformFeedbackVaryings?: string[],
) {
  const vertexShader =
    vertex instanceof WebGLShader ? vertex : createShader(gl, vertex, gl.VERTEX_SHADER);
  const fragmentShader =
    fragment instanceof WebGLShader ? fragment : createShader(gl, fragment, gl.FRAGMENT_SHADER);

  const program = gl.createProgram();
  if (program === null || vertexShader == null || fragmentShader == null) {
    console.error("could not create program");
    gl.deleteProgram(program);
    return null;
  }

  if (transformFeedbackVaryings) {
    gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.SEPARATE_ATTRIBS);
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("could not link program: " + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}
