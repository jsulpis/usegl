import type { Attribute } from "../types";
import { createAndBindBuffer, isSharedBufferSource } from "./buffer";

export function setAttribute(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
	attribute: Attribute,
) {
	const bufferData = getBufferData(attribute.data, name === "index");
	const location = gl.getAttribLocation(program, name);

	if (name === "index") {
		createAndBindBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, bufferData);
	}

	if (location === -1) {
		return { location, vertexCount: 0 };
	}

	createAndBindBuffer(gl, gl.ARRAY_BUFFER, bufferData);

	gl.enableVertexAttribArray(location);
	gl.vertexAttribPointer(
		location,
		attribute.size,
		attribute.type || getGLType(gl, bufferData),
		attribute.normalize || false,
		attribute.stride || 0,
		attribute.offset || 0,
	);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	const vertexCount = attribute.stride
		? bufferData.byteLength / attribute.stride
		: bufferData.length / attribute.size;

	return { location, vertexCount };
}

function getBufferData(data: Attribute["data"], isIndex: boolean) {
	if (isSharedBufferSource(data)) {
		return data;
	}
	if (isIndex) {
		return data.length < 65_536 ? new Uint16Array(data) : new Uint32Array(data);
	}
	return new Float32Array(data);
}

function getGLType(gl: WebGL2RenderingContext, data: ArrayBufferView) {
	if (data instanceof Float32Array) return gl.FLOAT;
	if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) return gl.UNSIGNED_BYTE;
	if (data instanceof Int8Array) return gl.BYTE;
	if (data instanceof Uint16Array) return gl.UNSIGNED_SHORT;
	if (data instanceof Int16Array) return gl.SHORT;
	if (data instanceof Uint32Array) return gl.UNSIGNED_INT;
	if (data instanceof Int32Array) return gl.INT;
	return gl.FLOAT;
}
