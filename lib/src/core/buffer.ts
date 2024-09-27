export function createAndBindBuffer(
	gl: WebGLRenderingContext,
	target: GLenum,
	data: AllowSharedBufferSource | number[]
) {
	const buffer = gl.createBuffer();
	const bufferData = isSharedBufferSource(data) ? data : new Float32Array(data);
	gl.bindBuffer(target, buffer);
	gl.bufferData(target, bufferData, gl.STATIC_DRAW);

	return buffer;
}

export function isSharedBufferSource(value: unknown): value is AllowSharedBufferSource {
	return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}
