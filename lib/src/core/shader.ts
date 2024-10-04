export function createShader(gl: WebGL2RenderingContext, source: string, type: GLenum) {
	const shader = gl.createShader(type);
	if (shader == null) {
		console.error("could not create shader");
		gl.deleteShader(shader);
		return null;
	}
	gl.shaderSource(shader, convertToGLSL300(source));
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error("could not compile shader: " + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}
	return shader;
}

function convertToGLSL300(shader: string): string {
	let glsl300Shader = shader.replace(/\battribute\b/g, "in").replace(/\btexture2D\b/g, "texture");

	if (shader.includes("gl_FragColor")) {
		// Fragment shader
		glsl300Shader = "out vec4 fragColor;\n" + glsl300Shader;
		glsl300Shader = glsl300Shader
			.replace(/\bvarying\b/g, "in")
			.replace(/\bgl_FragColor\b/g, "fragColor");
	} else {
		// Vertex shader
		glsl300Shader = glsl300Shader.replace(/\bvarying\b/g, "out");
	}

	const precisionRegex = /precision\s+(highp|mediump|lowp)\s+float\s*;/;
	if (!precisionRegex.test(glsl300Shader)) {
		glsl300Shader = glsl300Shader.replace(/^(#version 300 es)?/, "$1\nprecision highp float;\n");
	}

	if (!shader.startsWith("#version")) {
		glsl300Shader = "#version 300 es\n" + glsl300Shader;
	}

	return glsl300Shader;
}
