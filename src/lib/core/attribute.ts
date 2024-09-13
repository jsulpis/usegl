import { createBuffer, isSharedBufferSource } from "./buffer";

type TypedArray = ArrayBufferView & { length: number };

export interface AttributeObj {
	size: number;
	data: TypedArray | number[];
	type?: GLenum;
	normalize?: boolean;
	stride?: number;
	offset?: number;
}

export function setAttribute(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
	attribute: AttributeObj
) {
	const location = gl.getAttribLocation(program, name);
	if (location === -1) return { location, vertexCount: 0 };

	const bufferData = isSharedBufferSource(attribute.data)
		? attribute.data
		: new Float32Array(attribute.data);
	const buffer = createBuffer(gl, bufferData);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

	gl.enableVertexAttribArray(location);

	gl.vertexAttribPointer(
		location,
		attribute.size,
		attribute.type || getGLType(gl, bufferData),
		attribute.normalize || false,
		attribute.stride || 0,
		attribute.offset || 0
	);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const vertexCount = attribute.stride
		? bufferData.byteLength / attribute.stride
		: bufferData.length / attribute.size;

	return { location, vertexCount };
}

function getGLType(gl: WebGL2RenderingContext, data: ArrayBufferView) {
	if (data instanceof Float32Array) return gl.FLOAT;
	if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) return gl.UNSIGNED_BYTE;
	if (data instanceof Int8Array) return gl.BYTE;
	if (data instanceof Uint16Array) return gl.UNSIGNED_SHORT;
	if (data instanceof Int16Array) return gl.SHORT;
	if (data instanceof Uint32Array) return gl.UNSIGNED_INT;
	if (data instanceof Int32Array) return gl.INT;
}
