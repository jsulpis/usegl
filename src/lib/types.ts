export type VectorUniform =
	| [number, number]
	| [number, number, number]
	| [number, number, number, number];
export type UniformValue = number | VectorUniform;
export type Uniforms = Record<string, UniformValue | (() => UniformValue)> | {};

type TypedArray = ArrayBufferView & { length: number };

export interface Attribute {
	size: number;
	data: TypedArray | number[];
	type?: GLenum;
	normalize?: boolean;
	stride?: number;
	offset?: number;
}

export interface RenderTarget {
	framebuffer: WebGLFramebuffer;
	getTexture?: () => WebGLTexture;
	texture?: WebGLTexture;
	width: number;
	height: number;
	setSize: (width: number, height: number) => void;
}
