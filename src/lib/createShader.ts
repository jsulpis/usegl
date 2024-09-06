export function createShader(gl: WebGL2RenderingContext, source: string, type: GLenum) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("could not compile shader: " + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}
	return shader;
}
