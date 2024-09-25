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
	texture?: WebGLTexture;
	width: number;
	height: number;
	setSize: (width: number, height: number) => void;
}

export interface RenderPass<U extends Uniforms = {}> extends Resizable {
	render: () => void;
	target: RenderTarget | null;
	setTarget: (target: RenderTarget | null) => void;
	uniforms: U;
	vertex: string;
	fragment: string;
}

/**
 * An EffectPass can be created without the GL context, and must be initialized
 */
export interface EffectPass<U extends Uniforms = {}> extends RenderPass<U> {
	initialize: (gl: WebGL2RenderingContext, target: RenderTarget | null) => void;
}

export type CompositeEffect = EffectPass[];

export type PostEffect = EffectPass;

export type DrawMode =
	| "POINTS"
	| "LINES"
	| "LINE_STRIP"
	| "LINE_LOOP"
	| "TRIANGLES"
	| "TRIANGLE_STRIP"
	| "TRIANGLE_FAN";

export interface Resizable {
	setSize: ({ width, height }: { width: number; height: number }) => void;
}
