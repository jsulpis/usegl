const minFilterMap: Record<MinFilter, number> = {
  linear: WebGL2RenderingContext.LINEAR,
  nearest: WebGL2RenderingContext.NEAREST,
  "linear-mipmap-linear": WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR,
  "nearest-mipmap-linear": WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR,
};

const magFilterMap: Record<MagFilter, number> = {
  linear: WebGL2RenderingContext.LINEAR,
  nearest: WebGL2RenderingContext.NEAREST,
};

const wrapMap: Record<WrappingMode, number> = {
  "clamp-to-edge": WebGL2RenderingContext.CLAMP_TO_EDGE,
  repeat: WebGL2RenderingContext.REPEAT,
  "mirrored-repeat": WebGL2RenderingContext.MIRRORED_REPEAT,
};

/**
 * Given a WebGL2RenderingContext and a WebGLTexture, fill the texture with the given parameters.
 *
 * - if a src is provided with a loaded media, it will be uploaded directly
 * - if the src is an HTMLImageElement or HTMLVideoElement which is not loaded yet, a single black pixel is uploaded
 * - if no src is provided, the data parameter will be used (with default to a single black pixel)
 *
 * @param gl - The WebGL2 context.
 * @param texture - The WebGL texture to fill.
 * @param params - Configuration parameters for the texture.
 */
export function fillTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  params: TextureParams,
) {
  const isLoadingMedia =
    (isHTMLImageTexture(params) && !params.src.complete) ||
    (isHTMLVideoTexture(params) && params.src.readyState < 3);
  const isLoadedMedia = "src" in params && params.src != undefined && !isLoadingMedia;

  const {
    level = 0,
    flipY = true,
    format = WebGL2RenderingContext.RGBA,
    colorSpace = "linear-rgb",
    internalFormat = colorSpace === "srgb"
      ? WebGL2RenderingContext.SRGB8_ALPHA8
      : WebGL2RenderingContext.RGBA,
    type = WebGL2RenderingContext.UNSIGNED_BYTE,
    generateMipmaps = "src" in params && params.src != null, // no mipmap for data textures
    anisotropy = 1,
    minFilter = generateMipmaps ? "linear-mipmap-linear" : "linear",
    magFilter = "linear",
    wrapS = "clamp-to-edge",
    wrapT = "clamp-to-edge",
  } = params;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);

  if (isLoadedMedia) {
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, format, type, params.src);
  } else {
    const dataTexture = (params || {}) as DataTextureParams;
    const { data = new Uint8Array([0, 0, 0, 255]), width = 1, height = 1 } = dataTexture;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, 0, format, type, data);
  }

  if (generateMipmaps) {
    gl.generateMipmap(gl.TEXTURE_2D);

    // anisotropic filtering
    if (anisotropy > 1) {
      const ext = gl.getExtension("EXT_texture_filter_anisotropic");
      if (ext) {
        const maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        gl.texParameterf(
          gl.TEXTURE_2D,
          ext.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(maxAnisotropy, anisotropy),
        );
      }
    }
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilterMap[minFilter]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilterMap[magFilter]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMap[wrapS]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMap[wrapT]);
}

export function isHTMLImageTexture(params: any): params is ImageTextureParams<HTMLImageElement> {
  return typeof HTMLImageElement !== "undefined" && params.src instanceof HTMLImageElement;
}

export function isHTMLVideoTexture(params: any): params is ImageTextureParams<HTMLVideoElement> {
  return typeof HTMLVideoElement !== "undefined" && params.src instanceof HTMLVideoElement;
}

/**
 * Loads an image from a URL and returns a Promise resolving to {@link ImageTextureParams}.
 * @param src - URL of the image.
 * @param params - Additional texture parameters.
 */
export async function loadTexture<P extends BaseTextureParams>(
  src: string,
  params?: P,
): Promise<ImageTextureParams<ImageBitmap>> {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to load texture: ${src}`);
  }
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob, {
    imageOrientation: params?.flipY === false ? "none" : "flipY",
  });

  return { ...params, src: bitmap };
}

/**
 * Loads a video from a URL and returns {@link ImageTextureParams}.
 * @param src - URL of the video.
 * @param params - Additional video loading options.
 */
export function loadVideoTexture<P extends LoadVideoParams>(
  src: string,
  params?: P,
): ImageTextureParams<HTMLVideoElement> {
  if (typeof document === "undefined") {
    throw new TypeError("loadVideoTexture requires a document context.");
  }

  const video = document.createElement("video");

  video.loop = true;
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;

  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
  video.setAttribute("loop", "");
  video.setAttribute("autoplay", "");

  if (src.startsWith("http") && new URL(src).origin !== globalThis.location.origin) {
    video.crossOrigin = "anonymous";
  }

  const onReady = () => {
    const startVideo = () => {
      video.play();
    };
    if (params?.startTime && params?.startTime > 0) {
      video.currentTime = params.startTime;
      video.addEventListener("seeked", startVideo, { once: true });
    } else {
      startVideo();
    }
    video.removeEventListener("error", onerror);
  };

  const onerror = () => {
    console.error(`Failed to load texture: ${src}`);
    video.removeEventListener("canplay", onReady);
  };

  video.addEventListener("canplay", onReady, { once: true });
  video.addEventListener("error", onerror, { once: true });

  video.src = src;
  video.load();

  return { ...params, src: video };
}

/**
 * Creates texture parameters for a float data texture.
 * Useful for passing arbitrary numerical data to shaders.
 *
 * @param data - Flat array or Float32Array of data. Must have 4 components per element (RGBA).
 */
export function createFloatDataTexture(data: number[] | Float32Array): DataTextureParams {
  const elementsCount = data.length / 4;
  const textureWidth = Math.ceil(Math.sqrt(elementsCount));
  const textureHeight = Math.ceil(elementsCount / textureWidth);

  let dataArray: Float32Array;
  if (data.length === textureWidth * textureHeight * 4) {
    dataArray = data instanceof Float32Array ? data : new Float32Array(data);
  } else {
    dataArray = new Float32Array(textureWidth * textureHeight * 4).map(() => -1);
    dataArray.set(data);
  }

  return {
    data: dataArray,
    format: WebGL2RenderingContext.RGBA,
    type: WebGL2RenderingContext.FLOAT,
    internalFormat: WebGL2RenderingContext.RGBA32F,
    width: textureWidth,
    height: textureHeight,
    minFilter: "nearest",
    magFilter: "nearest",
    flipY: false,
  };
}

export type TextureData = ArrayBufferView | null;

type MagFilter = "linear" | "nearest";
type MinFilter = "linear" | "nearest" | "linear-mipmap-linear" | "nearest-mipmap-linear";
type ColorSpace = "srgb" | "linear-rgb";
type WrappingMode = "clamp-to-edge" | "repeat" | "mirrored-repeat";

/**
 * Base parameters for configuring a WebGL texture.
 */
export type BaseTextureParams = {
  /**
   * Texture minification filter.
   * @default "linear-mipmap-linear" if generateMipmaps is true, "linear" otherwise
   */
  minFilter?: MinFilter;
  /**
   * Texture magnification filter.
   * @default "linear"
   */
  magFilter?: MagFilter;
  /**
   * Wrapping mode for the S (U) coordinate.
   * @default "clamp-to-edge"
   */
  wrapS?: WrappingMode;
  /**
   * Wrapping mode for the T (V) coordinate.
   * @default "clamp-to-edge"
   */
  wrapT?: WrappingMode;
  /**
   * Whether to automatically generate mipmaps for this texture.
   * @default true
   */
  generateMipmaps?: boolean;
  /**
   * Level of anisotropic filtering to apply.
   * @default navigator.hardwareConcurrency
   */
  anisotropy?: number;
  /**
   * Whether to flip the image's Y axis to match WebGL's coordinate system.
   * @default true
   */
  flipY?: boolean;
  /**
   * The mipmap level to fill.
   * @default 0
   */
  level?: number;
  /**
   * The internal format of the texture in the GPU.
   * @default WebGL2RenderingContext.RGBA
   */
  internalFormat?: number;
  /**
   * The color space of the input data.
   * @default "linear-rgb"
   */
  colorSpace?: ColorSpace;
  /**
   * The format of the texel data.
   * @default WebGL2RenderingContext.RGBA
   */
  format?: number;
  /**
   * The data type of the texel data.
   * @default WebGL2RenderingContext.UNSIGNED_BYTE
   */
  type?: number;
};

/**
 * Parameters for creating a texture from raw data (TypedArray).
 */
export type DataTextureParams = BaseTextureParams & {
  /**
   * A typed array of texture data used to fill the texture.
   */
  data: TextureData;
  /**
   * The width of the texture in pixels.
   */
  width: number;
  /**
   * The height of the texture in pixels.
   */
  height: number;
};

/**
 * Parameters for creating a texture from an external source (Image, Video, etc.).
 */
export type ImageTextureParams<S extends TexImageSource = TexImageSource> = BaseTextureParams & {
  /**
   * A source of texture: image, video, canvas, etc.
   */
  src: S;
};

/**
 * Union type of all possible texture configuration parameters.
 */
export type TextureParams = DataTextureParams | ImageTextureParams;

/**
 * Parameters for loading a video texture.
 */
export interface LoadVideoParams extends BaseTextureParams {
  /**
   * Timecode in seconds from which to start the video.
   * @default 0
   */
  startTime?: number;
}
