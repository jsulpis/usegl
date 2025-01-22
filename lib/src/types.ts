import type { TextureParams } from "./core/texture";

export type VectorUniform =
  | [number, number]
  | [number, number, number]
  | [number, number, number, number];
export type TextureUniform = TextureParams | WebGLTexture;
export type UniformValue = number | VectorUniform | TextureUniform;
export type Uniforms = Record<string, UniformValue>;
export type EffectUniforms = Record<
  string,
  | UniformValue
  | ((passes: {
      /**
       * - in an effect with only one pass, the inputPass is the pass rendered  before this effect
       * - in an effect with multiple passes, the inputPass is the pass rendered before the first pass of the effect
       */
      inputPass: RenderPass;
      /**
       * pass rendered immediately before this effect
       */
      previousPass: RenderPass;
    }) => UniformValue)
>;

export type TypedArray = ArrayBufferView & { length: number };

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

export type EffectPass<U extends Uniforms = Record<string, never>> = RenderPass<U>;

export interface CompositeEffectPass<
  P extends Record<string, EffectPass<any>> = Record<string, EffectPass<never>>,
> extends Omit<EffectPass, "fragment" | "vertex" | "uniforms"> {
  passes: P;
}

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

export type RenderCallback<U extends Uniforms = Record<string, never>> = (
  args: Readonly<{ uniforms: U }>,
) => void;

export type UpdatedCallback<U extends Uniforms = Record<string, never>> = (
  uniforms: Readonly<U>,
  oldUniforms: Readonly<U>,
) => void;
