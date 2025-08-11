export type TextureData = ArrayBufferView | null;

type MagFilter = "linear" | "nearest";
type MinFilter = "linear" | "nearest" | "linear-mipmap-linear" | "nearest-mipmap-linear";
type ColorSpace = "srgb" | "linear-rgb";
type WrappingMode = "clamp-to-edge" | "repeat" | "mirrored-repeat";

export type BaseTextureParams = {
  /**
   * @default "linear-mipmap-linear" if generateMipmaps is true, "linear" otherwise
   */
  minFilter?: MinFilter;
  /**
   * @default "linear"
   */
  magFilter?: MagFilter;
  /**
   * @default "clamp-to-edge"
   */
  wrapS?: WrappingMode;
  /**
   * @default "clamp-to-edge"
   */
  wrapT?: WrappingMode;
  /**
   * @default true
   */
  generateMipmaps?: boolean;
  /**
   * @default navigator.hardwareConcurrency
   */
  anisotropy?: number;
  /**
   * @default true
   */
  flipY?: boolean;
  /**
   * @default 0
   */
  level?: number;
  /**
   * @default WebGL2RenderingContext.RGBA
   */
  internalFormat?: number;
  /**
   * @default "linear-rgb"
   */
  colorSpace?: ColorSpace;
  /**
   * @default WebGL2RenderingContext.RGBA
   */
  format?: number;
  /**
   * @default WebGL2RenderingContext.UNSIGNED_BYTE
   */
  type?: number;
};

export type DataTextureParams = BaseTextureParams & {
  /**
   * A typed array of texture data used to fill the texture.
   */
  data: TextureData;
  /**
   * The width of the texture.
   */
  width: number;
  /**
   * The height of the texture.
   */
  height: number;
};

export type ImageTextureParams = BaseTextureParams & {
  /**
   * A source of texture : image, video, canvas, etc.
   */
  src: TexImageSource;
  /**
   * Placeholder data to use while the src is loading.
   */
  placeholder?: DataTextureParams;
};

export type TextureParams = DataTextureParams | ImageTextureParams;

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
 * - if no src is provided, the data parameter will be used
 * - if a src is provided:
 *   - if it is an image that is loaded, or if it is a video that can start playing, they will be used to fill the texture
 *   - else, the placeholder parameter will be used, or a single black pixel will be used if no placeholder is specified
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
    generateMipmaps = "src" in params, // no mipmap for data textures
    anisotropy = 1,
    minFilter = generateMipmaps ? "linear-mipmap-linear" : "linear",
    magFilter = "linear",
    wrapS = "clamp-to-edge",
    wrapT = "clamp-to-edge",
  } = (isLoadingMedia ? params.placeholder : params) || {};

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);

  if (isLoadedMedia) {
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, format, type, params.src);
  } else {
    const dataTexture = ((isLoadingMedia ? params.placeholder : params) || {}) as DataTextureParams;
    const { data = new Uint8Array([0, 0, 0, 255]), width = 1, height = 1 } = dataTexture;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, 0, format, type, data);
  }

  if (generateMipmaps) {
    gl.generateMipmap(gl.TEXTURE_2D);

    // anisotropic filtering
    if (anisotropy > 1) {
      console.log("anisotropy", anisotropy);
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

export function isHTMLImageTexture(
  params: unknown,
): params is ImageTextureParams & { src: HTMLImageElement } {
  return (params as ImageTextureParams).src instanceof HTMLImageElement;
}

export function isHTMLVideoTexture(
  params: unknown,
): params is ImageTextureParams & { src: HTMLVideoElement } {
  return (params as ImageTextureParams).src instanceof HTMLVideoElement;
}

export function loadTexture<P extends Omit<ImageTextureParams, "src">>(src: string, params?: P) {
  const img = document.createElement("img");

  if (src.startsWith("http") && new URL(src).origin !== globalThis.location.origin) {
    img.crossOrigin = "anonymous";
  }

  const onload = () => {
    img.removeEventListener("error", onerror);
  };
  const onerror = () => {
    console.error(`Failed to load texture: ${src}`);
    img.removeEventListener("load", onload);
  };

  img.addEventListener("load", onload, { once: true });
  img.addEventListener("error", onerror, { once: true });

  img.src = src;

  return { ...(params as P), src: img };
}

interface LoadVideoOptions extends Omit<ImageTextureParams, "src"> {
  /**
   * Timecode in seconds from which to start the video.
   */
  startTime?: number;
}

export function loadVideoTexture<P extends LoadVideoOptions>(src: string, params?: P) {
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

  return { ...(params as P), src: video };
}

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
