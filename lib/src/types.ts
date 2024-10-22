import type { TextureData } from "./core/texture";

export type VectorUniform =
	| [number, number]
	| [number, number, number]
	| [number, number, number, number];
export type TextureUniform =
	| { data: TextureData; src?: never; width: number; height: number }
	| { data?: never; src: TexImageSource; width?: never; height?: never }
	| WebGLTexture;
export type UniformValue = number | VectorUniform | TextureUniform;
export type Uniforms = Record<string, UniformValue | (() => UniformValue)>;

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
	framebuffer: WebGLFramebuffer | null;
	texture: WebGLTexture | null;
	width: number;
	height: number;
	setSize: (width: number, height: number) => void;
}

export interface RenderPass<U extends Uniforms = Record<string, never>> extends Resizable {
	render: () => void;
	target: RenderTarget | null;
	setTarget: (target: RenderTarget | null) => void;
	uniforms: U;
	vertex: string;
	fragment: string;
	onUpdated: (callback: UpdatedCallback<U>) => void;
	onBeforeRender: (callback: RenderCallback<U>) => void;
	onAfterRender: (callback: RenderCallback<U>) => void;
	initialize: (gl: WebGL2RenderingContext) => void;
}

export type CompositeEffect = RenderPass<any>[];

export type PostEffect = RenderPass<any>;

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

export type RenderCallback<U extends Uniforms> = (args: Readonly<{ uniforms: U }>) => void;

export type UpdatedCallback<U extends Uniforms> = (
	uniforms: Readonly<U>,
	oldUniforms: Readonly<U>,
) => void;
