export function createBuffer(gl: WebGLRenderingContext, data: AllowSharedBufferSource | number[]) {
	const buffer = gl.createBuffer();
	const bufferData = isSharedBufferSource(data) ? data : new Float32Array(data);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, bufferData, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return buffer;
}

function isSharedBufferSource(value: unknown): value is AllowSharedBufferSource {
	return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}
