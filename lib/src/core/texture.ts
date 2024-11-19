export type TextureData = ArrayBufferView | null;

export type TextureOptions = {
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
	 * @default true if src is defined, false otherwise
	 */
	generateMipmaps?: boolean;
	/**
	 * @default navigator.hardwareConcurrency * 2 if src is defined, 0 otherwise
	 */
	anisotropy?: number;
	/**
	 * @default true if src is defined, false otherwise
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
	 * @default WebGL2RenderingContext.RGBA
	 */
	format?: number;
	/**
	 * @default WebGL2RenderingContext.UNSIGNED_BYTE
	 */
	type?: number;
} & (
	| { data: TextureData; src?: never; width: number; height: number }
	| { data?: never; src: TexImageSource }
);

type MagFilter = "linear" | "nearest";
type MinFilter = "linear" | "nearest" | "linear-mipmap-linear" | "nearest-mipmap-linear";
type WrappingMode = "clamp-to-edge" | "repeat" | "mirrored-repeat";

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

export function createTexture(gl: WebGL2RenderingContext, options: TextureOptions) {
	const {
		data = null,
		level = 0,
		flipY = true,
		internalFormat = WebGL2RenderingContext.RGBA,
		format = WebGL2RenderingContext.RGBA,
		type = WebGL2RenderingContext.UNSIGNED_BYTE,
		generateMipmaps = true,
		anisotropy = navigator.hardwareConcurrency, // in most case between 4 and 12, depending on the hardware range
		minFilter = generateMipmaps ? "linear-mipmap-linear" : "linear",
		magFilter = "linear",
		wrapS = "clamp-to-edge",
		wrapT = "clamp-to-edge",
	} = options || {};

	const boundTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);

	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);

	if (options.src === undefined) {
		gl.texImage2D(
			gl.TEXTURE_2D,
			level,
			internalFormat,
			options.width,
			options.height,
			0,
			format,
			type,
			data,
		);
	} else {
		gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, format, type, options.src);
	}

	if (generateMipmaps) {
		gl.generateMipmap(gl.TEXTURE_2D);

		// anisotropic filtering
		const ext = gl.getExtension("EXT_texture_filter_anisotropic");
		if (ext && anisotropy > 1) {
			const maxAnisotropy = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
			gl.texParameterf(
				gl.TEXTURE_2D,
				ext.TEXTURE_MAX_ANISOTROPY_EXT,
				Math.min(maxAnisotropy, anisotropy),
			);
		}
	}

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilterMap[minFilter]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilterMap[magFilter]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMap[wrapS]);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMap[wrapT]);

	gl.bindTexture(gl.TEXTURE_2D, boundTexture);

	return texture;
}

export function loadTexture(src: string, options?: Omit<TextureOptions, "src" | "data">) {
	return new Promise<TextureOptions>((resolve, reject) => {
		const img = document.createElement("img");
		const onload = () => {
			resolve({ src: img, ...options });
			img.removeEventListener("error", onerror);
		};
		const onerror = () => {
			reject(`Failed to load texture: ${src}`);
			img.removeEventListener("load", onload);
		};

		img.addEventListener("load", onload, { once: true });
		img.addEventListener("error", onerror, { once: true });

		img.src = src;
	});
}
