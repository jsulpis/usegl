export type VectorUniform =
	| [number, number]
	| [number, number, number]
	| [number, number, number, number];
export type UniformValue = number | VectorUniform;
export type Uniforms = Record<string, UniformValue> | {};

type TypedArray = ArrayBufferView & { length: number };

export interface Attribute {
	size: number;
	data: TypedArray | number[];
	type?: GLenum;
	normalize?: boolean;
	stride?: number;
	offset?: number;
}
